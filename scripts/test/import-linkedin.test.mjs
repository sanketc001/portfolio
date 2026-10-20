import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import zlib from 'node:zlib';

import {
  parseCSV,
  csvRecords,
  decodeEntities,
  listZip,
  extractZipEntry,
  loadExport,
  parseExport,
  applyImport,
  formatDescription,
  parseDate,
  formatDate,
} from '../import-linkedin.mjs';
import { buildKnowledge } from '../build-knowledge.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, '..', 'import-linkedin.mjs');

// ---------------------------------------------------------------------------
// Helpers: a tiny ZIP writer (stored or deflate, or any method id for raw bytes)

function crc32(buf) {
  if (typeof zlib.crc32 === 'function') return zlib.crc32(buf) >>> 0;
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

/** files: [{ name, data: string|Buffer, method?: 0|8|number }] */
function makeZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const f of files) {
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, 'utf8');
    const method = f.method ?? 8;
    const body = method === 8 ? zlib.deflateRawSync(data) : data;
    const name = Buffer.from(f.name, 'utf8');
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    locals.push(local, name, body);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);
    offset += 30 + name.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, eocd]);
}

const PROFILE_CSV =
  '﻿First Name,Last Name,Headline,Summary,Industry,Geo Location,Websites\r\n' +
  'Ada, Lovelace,Engineer | Builder,"Builds things &amp; ships them.\r\nSecond line.",Software,"London, UK",\r\n';
const POSITIONS_CSV =
  'Company Name,Title,Description,Location,Started On,Finished On\r\n' +
  'Acme,Engineer,,"Pune, India",Mar 2023,\r\n' +
  'Acme Client,Consultant,"Project A - Did X - Did Y  Project B - Did Z",Mumbai,Mar 2023,\r\n' +
  'Old Co,Intern,"Line one",Delhi,Jan 2019,Jun 2019\r\n' +
  'Club,Lead,Generic text,Pune,Aug 2021,May 2022\r\n';
const EDUCATION_CSV =
  'School Name,Start Date,End Date,Notes,Degree Name,Activities\r\n' +
  'Uni,Aug 2019,Aug 2023,,BTech,"Club A, Club B"\r\n' +
  'School,Apr 2013,Mar 2017,,,\r\n';
const SKILLS_CSV = 'Name\r\nPython (Programming Language)\r\npython\r\nLangChain\r\nVoice Acting\r\nKnitting\r\n';
const CERTS_CSV =
  'Name,Url,Authority,Started On,Finished On,License Number\r\n' +
  'Design Thinking,https://example.com/1,Coursera,Aug 2020,,AAA\r\n' +
  '" Neural Networks and Deep Learning",https://example.com/2,Coursera,Jun 2020,,BBB\r\n' +
  'Crash Course on Python,https://example.com/3,Coursera,Jul 2020,,CCC\r\n';

const CONFIG = {
  profile: { titleOverride: 'Engineer' },
  experience: {
    merge: [{ companies: ['Acme', 'Acme Client'], company: 'Acme @ Client', role: 'Engineer & Consultant' }],
    rename: { 'Old Co': 'Old Company' },
    roles: { 'Club|Lead': 'Club Lead' },
    keepCuratedDescription: ['Club'],
  },
  education: { hide: ['School'] },
  certifications: { relevantKeywords: ['neural', 'python'] },
  skills: {
    rename: { 'Python (Programming Language)': 'Python' },
    hide: ['Voice Acting'],
    categories: { LangChain: 'AI' },
    defaultCategory: 'Other',
  },
};

const BASE_DATA = {
  profile: { name: 'Old', title: 'Old title', pitch: 'Curated pitch', avatar: 'a.png', bio: 'old', location: 'x', email: 'e@x' },
  skills: { AI: ['RAG'], Engineering: ['python'] },
  experience: [
    { role: 'Club Lead', company: 'Club', period: 'August 2021 - May 2022', description: 'Curated club text', extra: 1 },
  ],
  featuredProjects: [{ id: 'p' }],
  linkedinPosts: [],
  certifications: [{ id: 'cert-1', title: 'Placeholder' }],
  mediaGallery: { documents: [] },
};

const exportFiles = {
  profile: PROFILE_CSV,
  positions: POSITIONS_CSV,
  education: EDUCATION_CSV,
  skills: SKILLS_CSV,
  certifications: CERTS_CSV,
};

// ---------------------------------------------------------------------------
// CSV

test('parseCSV handles quotes, escaped quotes, embedded commas and newlines, BOM, CRLF', () => {
  const rows = parseCSV('﻿a,b,c\r\n"x, y","he said ""hi""","multi\r\nline"\n1,,3\r\n\r\n');
  assert.deepEqual(rows, [
    ['a', 'b', 'c'],
    ['x, y', 'he said "hi"', 'multi\r\nline'],
    ['1', '', '3'],
  ]);
});

test('parseCSV handles a final row without newline and lone CR line endings', () => {
  assert.deepEqual(parseCSV('a,b\rc,"d"'), [
    ['a', 'b'],
    ['c', 'd'],
  ]);
});

test('csvRecords skips free-text notes before the header', () => {
  const recs = csvRecords('Notes:\n"Some, notes"\n\nName,Url\nX,y\n', 'Name');
  assert.deepEqual(recs, [{ Name: 'X', Url: 'y' }]);
});

test('decodeEntities decodes named and numeric entities once', () => {
  assert.equal(decodeEntities('A &amp; B &lt;3 &#39;q&#39; &#x2014; &amp;lt;'), "A & B <3 'q' — &lt;");
});

test('dates parse and format with full month names', () => {
  assert.equal(formatDate(parseDate('Mar 2023')), 'March 2023');
  assert.equal(formatDate(parseDate('September 2020')), 'September 2020');
  assert.equal(formatDate(parseDate('2019')), '2019');
  assert.equal(parseDate(''), null);
});

test('formatDescription rebuilds flattened LinkedIn bullets', () => {
  const flat =
    'Project A (2023 – 2024) - Did a thing that wraps   onto the next line - Did another  Section B - One more  Tech: X · Y';
  assert.equal(
    formatDescription(flat),
    'Project A (2023 – 2024)\n• Did a thing that wraps onto the next line\n• Did another\n\nSection B\n• One more\n\nTech: X · Y',
  );
});

test('formatDescription normalises bullets when line breaks are kept', () => {
  assert.equal(formatDescription('Intro\n- one\n* two\n• three'), 'Intro\n• one\n• two\n• three');
  assert.equal(formatDescription('Plain sentence, no bullets.'), 'Plain sentence, no bullets.');
});

// ---------------------------------------------------------------------------
// ZIP

test('zip reader extracts stored and deflated entries', () => {
  const zip = makeZip([
    { name: 'stored.txt', data: 'plain', method: 0 },
    { name: 'deflated.txt', data: 'hello '.repeat(50), method: 8 },
  ]);
  const entries = listZip(zip);
  assert.deepEqual(
    entries.map((e) => [e.name, e.method]),
    [
      ['stored.txt', 0],
      ['deflated.txt', 8],
    ],
  );
  assert.equal(extractZipEntry(zip, entries[0]).toString(), 'plain');
  assert.equal(extractZipEntry(zip, entries[1]).toString(), 'hello '.repeat(50));
});

test('zip reader rejects non-zip input', () => {
  assert.throws(() => listZip(Buffer.from('not a zip file at all, definitely not')), /Not a ZIP/);
});

test('loadExport reads only whitelisted files from a zip', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'li-zip-'));
  const zipPath = join(dir, 'Basic_LinkedInDataExport.zip');
  // The non-whitelisted entries use an unsupported compression method: decompressing
  // them would throw, so a successful load proves they were never touched.
  await writeFile(
    zipPath,
    makeZip([
      { name: 'messages.csv', data: Buffer.from('SECRET MESSAGE'), method: 99 },
      { name: 'Connections.csv', data: Buffer.from('SECRET CONNECTION'), method: 99 },
      { name: 'PhoneNumbers.csv', data: 'Number\n+1 555', method: 8 },
      { name: 'Profile.csv', data: PROFILE_CSV, method: 8 },
      { name: 'Positions.csv', data: POSITIONS_CSV, method: 0 },
      { name: 'Skills.csv', data: SKILLS_CSV },
    ]),
  );
  const files = await loadExport(zipPath);
  assert.deepEqual(Object.keys(files).sort(), ['positions', 'profile', 'skills']);
  assert.ok(!Object.values(files).some((t) => t.includes('SECRET') || t.includes('+1 555')));
});

test('loadExport reads only whitelisted files from a folder', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'li-dir-'));
  await writeFile(join(dir, 'Profile.csv'), PROFILE_CSV);
  await writeFile(join(dir, 'Connections.csv'), 'SECRET');
  await mkdir(join(dir, 'nested'));
  await writeFile(join(dir, 'nested', 'Positions.csv'), POSITIONS_CSV);
  await writeFile(join(dir, 'nested', 'messages.csv'), 'SECRET');
  const files = await loadExport(dir);
  assert.deepEqual(Object.keys(files).sort(), ['positions', 'profile']);
});

test('loadExport refuses an export without Profile.csv or Positions.csv', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'li-missing-'));
  const zipPath = join(dir, 'export.zip');
  await writeFile(zipPath, makeZip([{ name: 'Profile.csv', data: PROFILE_CSV }]));
  await assert.rejects(loadExport(zipPath), (err) => err.code === 'MISSING_FILES' && /Positions\.csv/.test(err.message));
});

test('CLI exits 1 when required files are missing and writes nothing', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'li-cli-'));
  const zipPath = join(dir, 'export.zip');
  await writeFile(zipPath, makeZip([{ name: 'Skills.csv', data: SKILLS_CSV }]));
  const res = spawnSync(process.execPath, [script, zipPath, '--dry-run'], { encoding: 'utf8' });
  assert.equal(res.status, 1);
  assert.match(res.stderr, /Profile\.csv and Positions\.csv/);
});

// ---------------------------------------------------------------------------
// Applying rules

function run() {
  return applyImport(structuredClone(BASE_DATA), parseExport(exportFiles), CONFIG);
}

test('profile fields are owned; curated fields and key order are preserved', () => {
  const { data } = run();
  assert.deepEqual(Object.keys(data.profile), ['name', 'title', 'headline', 'pitch', 'avatar', 'bio', 'location', 'email']);
  assert.equal(data.profile.name, 'Ada Lovelace');
  assert.equal(data.profile.title, 'Engineer');
  assert.equal(data.profile.headline, 'Engineer | Builder');
  assert.equal(data.profile.bio, 'Builds things & ships them.\nSecond line.');
  assert.equal(data.profile.pitch, 'Curated pitch');
  assert.equal(data.profile.location, 'London, UK');
  assert.deepEqual(Object.keys(data), [
    'profile', 'skills', 'experience', 'education', 'featuredProjects', 'linkedinPosts', 'certifications', 'mediaGallery',
  ]);
  assert.deepEqual(data.featuredProjects, [{ id: 'p' }]);
});

test('experience: merge, rename, role override, curated description, ordering', () => {
  const { data } = run();
  assert.deepEqual(
    data.experience.map((e) => [e.role, e.company, e.period]),
    [
      ['Engineer & Consultant', 'Acme @ Client', 'March 2023 - Present'],
      ['Club Lead', 'Club', 'August 2021 - May 2022'],
      ['Intern', 'Old Company', 'January 2019 - June 2019'],
    ],
  );
  const [merged, club] = data.experience;
  assert.equal(merged.description, 'Project A\n• Did X\n• Did Y\n\nProject B\n• Did Z');
  assert.equal(merged.location, 'Mumbai');
  assert.equal(club.description, 'Curated club text');
  assert.equal(club.extra, 1, 'curated extra fields survive');
  assert.deepEqual(Object.keys(merged), ['role', 'company', 'period', 'location', 'description']);
});

test('merge is skipped when start dates differ', () => {
  const files = { ...exportFiles, positions: POSITIONS_CSV.replace('Mumbai,Mar 2023', 'Mumbai,Apr 2023') };
  const { data } = applyImport(structuredClone(BASE_DATA), parseExport(files), CONFIG);
  assert.ok(data.experience.some((e) => e.company === 'Acme'));
  assert.ok(data.experience.some((e) => e.company === 'Acme Client'));
});

test('education hides configured schools', () => {
  const { data } = run();
  assert.deepEqual(data.education, [
    { school: 'Uni', degree: 'BTech', start: 'August 2019', end: 'August 2023', activities: 'Club A, Club B' },
  ]);
});

test('certifications are replaced, trimmed and sorted by relevance then date', () => {
  const { data, summary } = run();
  assert.deepEqual(
    data.certifications.map((c) => c.title),
    ['Neural Networks and Deep Learning', 'Crash Course on Python', 'Design Thinking'],
  );
  assert.deepEqual(data.certifications[0], {
    id: 'neural-networks-and-deep-learning',
    title: 'Neural Networks and Deep Learning',
    issuer: 'Coursera',
    date: 'June 2020',
    credentialId: 'BBB',
    url: 'https://example.com/2',
  });
  assert.deepEqual(summary.certifications.removed, ['Placeholder']);
});

test('skills: rename, hide, map categories, no case-insensitive duplicates', () => {
  const { data, summary } = run();
  assert.deepEqual(data.skills, { AI: ['RAG', 'LangChain'], Engineering: ['python'], Other: ['Knitting'] });
  assert.deepEqual(summary.skills.hidden, ['Voice Acting']);
});

test('import is idempotent', () => {
  const first = run().data;
  const second = applyImport(structuredClone(first), parseExport(exportFiles), CONFIG).data;
  assert.deepEqual(second, first);
});

// ---------------------------------------------------------------------------
// Knowledge base

test('buildKnowledge includes data sections and extra markdown, without the extra comment', () => {
  const { data } = run();
  const md = buildKnowledge(data, '<!-- note -->\n\n## Availability\n\nOpen to roles.\n');
  assert.match(md, /^<!-- GENERATED FILE/);
  assert.match(md, /## Profile[\s\S]*Pitch: Curated pitch/);
  assert.match(md, /### Engineer & Consultant, Acme @ Client \(March 2023 - Present\)/);
  assert.match(md, /- Did X/);
  assert.match(md, /## Education\n\n- BTech, Uni \(August 2019 – August 2023\)/);
  assert.match(md, /## Availability\n\nOpen to roles\./);
  assert.ok(!md.includes('<!-- note -->'));
});
