#!/usr/bin/env node
// Imports profile data from a LinkedIn data export into src/data/portfolioData.json.
//
//   npm run import:linkedin -- <export.zip | extracted-folder> [--dry-run] [--config <file>]
//
// Request the export on LinkedIn: Settings -> Data privacy -> Get a copy of your data.
// Only the six profile files listed in EXPORT_FILES are ever read; everything else in
// the export (messages, connections, contact details, ...) is ignored and never
// decompressed or copied.
//
// Fields owned by the importer: profile.name/title/headline/bio/location, experience,
// education, certifications, and the LinkedIn skills merged into the curated skill
// categories. Everything else in portfolioData.json is left untouched.
// Rules (merges, renames, hidden entries, skill categories) live in
// scripts/linkedin-import.config.json.

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import zlib from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
export const DATA_PATH = join(root, 'src', 'data', 'portfolioData.json');
export const CONFIG_PATH = join(here, 'linkedin-import.config.json');

/** Whitelist of export files the importer reads. Nothing else is touched. */
export const EXPORT_FILES = {
  profile: 'Profile.csv',
  summary: 'Profile Summary.csv',
  positions: 'Positions.csv',
  education: 'Education.csv',
  skills: 'Skills.csv',
  certifications: 'Certifications.csv',
};
const REQUIRED = ['profile', 'positions'];

// ---------------------------------------------------------------------------
// CSV

/** RFC 4180 CSV parser: quoted fields, "" escapes, embedded commas/newlines, BOM, CRLF/LF/CR. */
export function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"' && field === '') {
      inQuotes = true;
      i++;
    } else if (c === ',') {
      row.push(field);
      field = '';
      i++;
    } else if (c === '\r' || c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += c === '\r' && text[i + 1] === '\n' ? 2 : 1;
    } else {
      field += c;
      i++;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  // Drop blank lines.
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

/**
 * Parses CSV into objects keyed by header name. Some LinkedIn files start with
 * free-text notes before the header; when `expect` names a column, rows before
 * the first row containing it are skipped.
 */
export function csvRecords(text, expect) {
  const rows = parseCSV(text);
  let start = 0;
  if (expect) {
    const idx = rows.findIndex((r) => r.some((h) => h.trim().toLowerCase() === expect.toLowerCase()));
    if (idx >= 0) start = idx;
  }
  if (!rows[start]) return [];
  const header = rows[start].map((h) => h.trim());
  return rows.slice(start + 1).map((r) => {
    const obj = {};
    header.forEach((h, j) => {
      obj[h] = r[j] ?? '';
    });
    return obj;
  });
}

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', '#39': "'" };

/** Decodes HTML entities (single pass, so "&amp;lt;" becomes "&lt;"). */
export function decodeEntities(s) {
  return String(s ?? '').replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
    }
    const v = NAMED_ENTITIES[e.toLowerCase()];
    return v ?? m;
  });
}

/** Entity-decoded, trimmed text with runs of inline whitespace collapsed. */
export function clean(s) {
  return decodeEntities(s)
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
}

// ---------------------------------------------------------------------------
// ZIP (central directory; stored and deflate entries)

/** Lists the entries of a ZIP buffer without decompressing anything. */
export function listZip(buf) {
  const min = Math.max(0, buf.length - 0xffff - 22);
  let eocd = -1;
  for (let i = buf.length - 22; i >= min; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('Not a ZIP file (end of central directory not found)');
  const count = buf.readUInt16LE(eocd + 10);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  if (count === 0xffff || cdOffset === 0xffffffff) throw new Error('ZIP64 archives are not supported');
  const entries = [];
  let p = cdOffset;
  for (let n = 0; n < count; n++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) {
      throw new Error('Corrupt ZIP central directory');
    }
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16);
    const compressedSize = buf.readUInt32LE(p + 20);
    const size = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const offset = buf.readUInt32LE(p + 42);
    const name = buf.toString(flags & 0x800 ? 'utf8' : 'latin1', p + 46, p + 46 + nameLen);
    entries.push({ name, flags, method, crc, compressedSize, size, offset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

/** Decompresses one entry returned by listZip. */
export function extractZipEntry(buf, entry) {
  const p = entry.offset;
  if (buf.readUInt32LE(p) !== 0x04034b50) throw new Error(`Corrupt local header for ${entry.name}`);
  if (entry.flags & 1) throw new Error(`${entry.name} is encrypted`);
  const start = p + 30 + buf.readUInt16LE(p + 26) + buf.readUInt16LE(p + 28);
  const raw = buf.subarray(start, start + entry.compressedSize);
  let out;
  if (entry.method === 0) out = raw;
  else if (entry.method === 8) out = zlib.inflateRawSync(raw);
  else throw new Error(`${entry.name}: unsupported compression method ${entry.method}`);
  if (out.length !== entry.size) throw new Error(`${entry.name}: size mismatch`);
  if (typeof zlib.crc32 === 'function' && (zlib.crc32(out) >>> 0) !== entry.crc) {
    throw new Error(`${entry.name}: CRC mismatch`);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Loading an export

function wantedKey(path) {
  const base = path.split(/[\\/]/).pop().toLowerCase();
  return Object.keys(EXPORT_FILES).find((k) => EXPORT_FILES[k].toLowerCase() === base);
}
const depth = (path) => path.split(/[\\/]/).filter(Boolean).length;

/**
 * Reads the whitelisted CSV files from a .zip or an extracted folder.
 * Returns { profile: text, positions: text, ... } (missing files are absent).
 */
export async function loadExport(inputPath) {
  const info = await stat(inputPath);
  const files = {};
  if (info.isDirectory()) {
    const candidates = [];
    for (const name of await readdir(inputPath)) {
      const full = join(inputPath, name);
      const s = await stat(full);
      if (s.isFile()) candidates.push(name);
      else if (s.isDirectory()) {
        for (const sub of await readdir(full)) candidates.push(join(name, sub));
      }
    }
    candidates.sort((a, b) => depth(a) - depth(b));
    for (const rel of candidates) {
      const key = wantedKey(rel);
      if (key && !(key in files)) files[key] = await readFile(join(inputPath, rel), 'utf8');
    }
  } else {
    const buf = await readFile(inputPath);
    const entries = listZip(buf)
      .filter((e) => !e.name.endsWith('/'))
      .sort((a, b) => depth(a.name) - depth(b.name));
    for (const entry of entries) {
      const key = wantedKey(entry.name);
      if (key && !(key in files)) files[key] = extractZipEntry(buf, entry).toString('utf8');
    }
  }
  const missing = REQUIRED.filter((k) => !(k in files));
  if (missing.length) {
    const err = new Error(
      `Export is missing ${missing.map((k) => EXPORT_FILES[k]).join(' and ')}. ` +
        'Use the full LinkedIn data export (Settings -> Data privacy -> Get a copy of your data).',
    );
    err.code = 'MISSING_FILES';
    throw err;
  }
  return files;
}

// ---------------------------------------------------------------------------
// Dates and text

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "Mar 2023" / "March 2023" / "2023" / "2023-03" -> { year, month } (month 1-12 or 0). */
export function parseDate(s) {
  const t = clean(s);
  if (!t) return null;
  let m = t.match(/^([A-Za-z]{3,})\.?\s+(\d{4})$/);
  if (m) {
    const idx = MONTHS.findIndex((name) => name.toLowerCase().startsWith(m[1].slice(0, 3).toLowerCase()));
    if (idx >= 0) return { year: Number(m[2]), month: idx + 1 };
  }
  m = t.match(/^(\d{4})(?:-(\d{1,2}))?/);
  if (m) return { year: Number(m[1]), month: m[2] ? Number(m[2]) : 0 };
  return null;
}

export function formatDate(d) {
  if (!d) return '';
  return d.month ? `${MONTHS[d.month - 1]} ${d.year}` : String(d.year);
}

const dateValue = (d) => (d ? d.year * 12 + (d.month || 1) : 0);

/**
 * Normalises a position description. LinkedIn exports either keep line breaks or
 * flatten them: wrapped lines become 3+ spaces, blank lines 2 spaces and list items
 * " - ". Both are turned into lines, with bullets written as "• ".
 */
export function formatDescription(raw) {
  let s = decodeEntities(raw).replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ').trim();
  if (!s) return '';
  const bullet = /^\s*(?:[-*•▪◦·]|–)\s+/;
  let lines;
  if (s.includes('\n')) {
    lines = s.split('\n').map((l) => (bullet.test(l) ? `• ${l.replace(bullet, '').trim()}` : l.trim()));
  } else if (/\S {2}\S/.test(s.replace(/ {3,}/g, ' ')) || / - /.test(s)) {
    s = s.replace(/ {3,}/g, ' ');
    lines = [];
    for (const para of s.split(/ {2,}/)) {
      const parts = (' ' + para.trim()).split(/ - (?=\S)/);
      const head = parts.shift().trim();
      if (lines.length) lines.push('');
      if (head) lines.push(head.replace(bullet, '• '));
      for (const p of parts) lines.push(`• ${p.trim()}`);
    }
  } else {
    lines = [s.replace(/ {2,}/g, ' ')];
  }
  return lines
    .map((l) => l.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function slugify(s) {
  return clean(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const lc = (s) => String(s).trim().toLowerCase();
const inList = (list, value) => (list || []).some((x) => lc(x) === lc(value));

/** Returns a copy of obj with `key` set; new keys go right after `after` (or at the end). */
function setKey(obj, key, value, after) {
  if (key in obj || !after || !(after in obj)) return { ...obj, [key]: value };
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v;
    if (k === after) out[key] = value;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Parsing the export into plain records

export function parseExport(files) {
  const profile = csvRecords(files.profile, 'First Name')[0] || {};
  const summaryRows = files.summary ? parseCSV(files.summary) : [];
  const summaryText = summaryRows.length > 1 ? summaryRows.slice(1).map((r) => r.join(' ')).join('\n') : '';
  const positions = csvRecords(files.positions, 'Company Name').map((r) => ({
    company: clean(r['Company Name']),
    title: clean(r['Title']),
    description: formatDescription(r['Description']),
    location: clean(r['Location']),
    start: parseDate(r['Started On']),
    end: parseDate(r['Finished On']),
  }));
  const education = files.education
    ? csvRecords(files.education, 'School Name').map((r) => ({
        school: clean(r['School Name']),
        degree: clean(r['Degree Name']),
        start: parseDate(r['Start Date']),
        end: parseDate(r['End Date']),
        notes: clean(r['Notes']),
        activities: clean(r['Activities']),
      }))
    : [];
  const skills = files.skills ? csvRecords(files.skills, 'Name').map((r) => clean(r['Name'])).filter(Boolean) : [];
  const certifications = files.certifications
    ? csvRecords(files.certifications, 'Name').map((r) => ({
        title: clean(r['Name']),
        url: clean(r['Url']),
        issuer: clean(r['Authority']),
        start: parseDate(r['Started On']),
        end: parseDate(r['Finished On']),
        licenseNumber: clean(r['License Number']),
      }))
    : [];
  return {
    profile: {
      firstName: clean(profile['First Name']),
      lastName: clean(profile['Last Name']),
      headline: clean(profile['Headline']),
      summary: clean(profile['Summary']) || clean(summaryText),
      location: clean(profile['Geo Location']),
    },
    positions: positions.filter((p) => p.company || p.title),
    education: education.filter((e) => e.school),
    skills,
    certifications: certifications.filter((c) => c.title),
  };
}

// ---------------------------------------------------------------------------
// Applying the export to portfolioData

function sameDate(a, b) {
  return !!a && !!b && a.year === b.year && a.month === b.month;
}

function buildExperience(positions, existing, cfg = {}) {
  let list = positions.filter((p) => !inList(cfg.hide, p.company));

  // Merge rules: all listed companies present with the same start date -> one entry.
  for (const rule of cfg.merge || []) {
    const members = (rule.companies || []).map((name) => list.find((p) => lc(p.company) === lc(name)));
    if (members.length < 2 || members.some((m) => !m)) continue;
    if (!members.every((m) => sameDate(m.start, members[0].start))) continue;
    const withDesc = members.find((m) => m.description) || members[0];
    const ends = members.map((m) => m.end);
    const merged = {
      company: rule.company || members.map((m) => m.company).join(' @ '),
      title: rule.role || members.map((m) => m.title).join(' & '),
      description: withDesc.description,
      location: rule.location || withDesc.location || members.find((m) => m.location)?.location || '',
      start: members[0].start,
      end: ends.some((e) => !e) ? null : ends.sort((a, b) => dateValue(b) - dateValue(a))[0],
      merged: true,
      sources: members.map((m) => m.company),
    };
    list = [merged, ...list.filter((p) => !members.includes(p))];
  }

  // Ongoing roles first, then by end date, then by start date (newest first).
  list.sort((a, b) => {
    if (!a.end !== !b.end) return a.end ? 1 : -1;
    const byEnd = dateValue(b.end) - dateValue(a.end);
    return byEnd || dateValue(b.start) - dateValue(a.start);
  });

  const rename = cfg.rename || {};
  const roles = cfg.roles || {};
  const used = new Set();
  return list.map((p) => {
    const company = rename[p.company] ?? p.company;
    const role = p.merged ? p.title : roles[`${p.company}|${p.title}`] ?? roles[p.company] ?? p.title;
    const startText = formatDate(p.start);
    const period = `${startText} - ${p.end ? formatDate(p.end) : 'Present'}`;

    // The current entry for the same role, used to keep curated descriptions and extra fields.
    const candidates = existing.filter((e, i) => !used.has(i) && String(e.period || '').startsWith(startText));
    const firstWord = lc(company.split(/\s+/)[0] || '');
    const match =
      candidates.find((e) => lc(e.company) === lc(company)) ||
      candidates.find((e) => lc(e.company).split(/\s+/)[0] === firstWord) ||
      (candidates.length === 1 ? candidates[0] : undefined);
    if (match) used.add(existing.indexOf(match));

    let description = p.description;
    const keepCurated = inList(cfg.keepCuratedDescription, p.company) || inList(cfg.keepCuratedDescription, company);
    if ((keepCurated || !description) && match?.description) description = match.description;

    const entry = { ...(match || {}), role, company, period };
    if (p.location) entry.location = p.location;
    entry.description = description || '';
    // Fixed key order for owned fields, curated extra fields after them.
    const { role: r, company: c, period: pe, location: lo, description: d, ...extra } = entry;
    return { role: r, company: c, period: pe, ...(lo ? { location: lo } : {}), description: d, ...extra };
  });
}

function buildEducation(education, cfg = {}) {
  return education
    .filter((e) => !inList(cfg.hide, e.school))
    .sort((a, b) => dateValue(b.start) - dateValue(a.start))
    .map((e) => {
      const out = { school: e.school };
      if (e.degree) out.degree = e.degree;
      if (e.start) out.start = formatDate(e.start);
      if (e.end) out.end = formatDate(e.end);
      if (e.notes) out.notes = e.notes;
      if (e.activities) out.activities = e.activities;
      return out;
    });
}

function buildCertifications(certs, cfg = {}) {
  const keywords = (cfg.relevantKeywords || []).map(
    (k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'),
  );
  // Keywords are in priority order: a title matching an earlier keyword ranks higher.
  const rank = (c) => {
    const i = keywords.findIndex((re) => re.test(c.title));
    return i < 0 ? keywords.length : i;
  };
  const ids = new Set();
  return certs
    .filter((c) => !inList(cfg.hide, c.title))
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const byRel = rank(a.c) - rank(b.c);
      return byRel || dateValue(b.c.start) - dateValue(a.c.start) || a.i - b.i;
    })
    .map(({ c }) => {
      let id = slugify(c.title) || 'certificate';
      for (let n = 2; ids.has(id); n++) id = `${slugify(c.title)}-${n}`;
      ids.add(id);
      const out = { id, title: c.title, issuer: c.issuer, date: formatDate(c.start) };
      if (c.licenseNumber) out.credentialId = c.licenseNumber;
      if (c.url) out.url = c.url;
      return out;
    });
}

function mergeSkills(curated, linkedinSkills, cfg = {}) {
  const skills = Object.fromEntries(Object.entries(curated || {}).map(([k, v]) => [k, [...v]]));
  const seen = new Set(Object.values(skills).flat().map(lc));
  const rename = cfg.rename || {};
  const categories = cfg.categories || {};
  const added = [];
  const hidden = [];
  for (const original of linkedinSkills) {
    const name = rename[original] ?? original;
    if (inList(cfg.hide, original) || inList(cfg.hide, name)) {
      hidden.push(original);
      continue;
    }
    if (seen.has(lc(name))) continue;
    const category = categories[original] ?? categories[name] ?? cfg.defaultCategory ?? 'Other';
    (skills[category] ||= []).push(name);
    seen.add(lc(name));
    added.push({ name, category });
  }
  return { skills, added, hidden };
}

/** Pure transform: returns { data, summary } without touching the filesystem. */
export function applyImport(data, parsed, config = {}) {
  const summary = { profile: [], experience: [], education: [], certifications: {}, skills: {} };
  const pcfg = config.profile || {};

  let profile = { ...(data.profile || {}) };
  const name = [parsed.profile.firstName, parsed.profile.lastName].filter(Boolean).join(' ');
  const updates = {
    name,
    title: pcfg.titleOverride || parsed.profile.headline,
    headline: parsed.profile.headline,
    bio: parsed.profile.summary,
    location: parsed.profile.location,
  };
  const anchors = { name: undefined, title: 'name', headline: 'title', bio: 'avatar', location: 'bio' };
  for (const [key, value] of Object.entries(updates)) {
    if (!value) continue;
    if (profile[key] !== value) summary.profile.push(key);
    profile = setKey(profile, key, value, anchors[key]);
  }

  const experience = buildExperience(parsed.positions, data.experience || [], config.experience);
  summary.experience = experience.map((e) => `${e.role}, ${e.company} (${e.period})`);

  const education = buildEducation(parsed.education, config.education);
  summary.education = education.map((e) => `${e.school}${e.degree ? `, ${e.degree}` : ''}`);

  const certifications = buildCertifications(parsed.certifications, config.certifications);
  const oldTitles = (data.certifications || []).map((c) => c.title);
  const newTitles = certifications.map((c) => c.title);
  summary.certifications = {
    total: certifications.length,
    added: newTitles.filter((t) => !oldTitles.includes(t)),
    removed: oldTitles.filter((t) => !newTitles.includes(t)),
  };

  const { skills, added, hidden } = mergeSkills(data.skills, parsed.skills, config.skills);
  summary.skills = { added, hidden };

  let out = { ...data, profile, skills, experience };
  out = setKey(out, 'education', education, 'experience');
  out = setKey(out, 'certifications', certifications, 'linkedinPosts');
  return { data: out, summary };
}

export function formatSummary(summary, changed) {
  const lines = [];
  lines.push(`Profile fields changed: ${summary.profile.length ? summary.profile.join(', ') : 'none'}`);
  lines.push(`Experience (${summary.experience.length}):`);
  for (const e of summary.experience) lines.push(`  - ${e}`);
  lines.push(`Education (${summary.education.length}):`);
  for (const e of summary.education) lines.push(`  - ${e}`);
  const c = summary.certifications;
  lines.push(`Certifications: ${c.total} (added ${c.added.length}, removed ${c.removed.length})`);
  for (const t of c.added) lines.push(`  + ${t}`);
  for (const t of c.removed) lines.push(`  - ${t}`);
  const s = summary.skills;
  lines.push(`Skills: ${s.added.length} new, ${s.hidden.length} hidden by config`);
  for (const a of s.added) lines.push(`  + ${a.name} -> ${a.category}`);
  if (changed !== undefined) lines.push(changed ? 'portfolioData.json: changed' : 'portfolioData.json: no changes');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// CLI

function serialise(data, eol) {
  return (JSON.stringify(data, null, 2) + '\n').replace(/\n/g, eol);
}

async function main(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const cfgIdx = args.indexOf('--config');
  const configPath = cfgIdx >= 0 ? resolve(args[cfgIdx + 1]) : CONFIG_PATH;
  const input = args.find((a, i) => !a.startsWith('--') && (cfgIdx < 0 || i !== cfgIdx + 1));
  if (!input) {
    console.error('Usage: npm run import:linkedin -- <LinkedIn export .zip or folder> [--dry-run] [--config <file>]');
    return 1;
  }

  let files;
  try {
    files = await loadExport(resolve(input));
  } catch (err) {
    console.error(`import-linkedin: ${err.message}`);
    return 1;
  }
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const raw = await readFile(DATA_PATH, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const { data, summary } = applyImport(JSON.parse(raw), parseExport(files), config);
  const next = serialise(data, eol);
  const changed = next !== raw;

  console.log(`Read ${Object.keys(files).map((k) => EXPORT_FILES[k]).join(', ')}`);
  console.log(formatSummary(summary, changed));
  if (dryRun) {
    console.log('Dry run: nothing written.');
    return 0;
  }
  if (changed) await writeFile(DATA_PATH, next, 'utf8');
  const { writeKnowledge } = await import('./build-knowledge.mjs');
  const knowledgeChanged = await writeKnowledge();
  console.log(`chat-proxy/knowledge.md: ${knowledgeChanged ? 'regenerated' : 'up to date'}`);
  console.log('Review with `git diff`, then commit and push to redeploy the site and chat.');
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv).then(
    (code) => process.exit(code),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}
