#!/usr/bin/env node
// Builds chat-proxy/knowledge.md (the "Ask my portfolio" knowledge base) from
// src/data/portfolioData.json plus the hand-written chat-proxy/knowledge.extra.md.
//
//   node scripts/build-knowledge.mjs          write chat-proxy/knowledge.md
//   node scripts/build-knowledge.mjs --check  exit 1 if knowledge.md is out of date

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
export const PATHS = {
  data: join(root, 'src', 'data', 'portfolioData.json'),
  extra: join(root, 'chat-proxy', 'knowledge.extra.md'),
  out: join(root, 'chat-proxy', 'knowledge.md'),
};

const HEADER = `<!-- GENERATED FILE: do not edit. Built by scripts/build-knowledge.mjs from
src/data/portfolioData.json and chat-proxy/knowledge.extra.md; edit those and
run \`npm run knowledge\`. -->`;

const bulletLine = (line) => line.replace(/^•\s*/, '- ');

function descriptionLines(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => bulletLine(l.trim()));
}

function section(title, body) {
  const content = body.filter((b) => b !== undefined && b !== null);
  return content.length ? [`## ${title}`, '', ...content, ''] : [];
}

/** Builds the knowledge base text from parsed portfolio data and the extra markdown. */
export function buildKnowledge(data, extra = '') {
  const p = data.profile || {};
  const out = [HEADER, '', `# ${p.name || 'Portfolio'}: portfolio knowledge base`, ''];
  out.push(
    'This file is the only source of facts for the "Ask my portfolio" assistant.',
    'Anything not written here is unknown to the assistant.',
    '',
  );

  const profileLines = [];
  if (p.name) profileLines.push(`- Name: ${p.name}`);
  if (p.title) profileLines.push(`- Title: ${p.title}`);
  if (p.headline && p.headline !== p.title) profileLines.push(`- LinkedIn headline: ${p.headline}`);
  if (p.location) profileLines.push(`- Location: ${p.location}`);
  if (p.email) profileLines.push(`- Email: ${p.email}`);
  if (p.github) profileLines.push(`- GitHub: ${p.github}`);
  if (p.linkedin) profileLines.push(`- LinkedIn: ${p.linkedin}`);
  if (p.pitch) profileLines.push('', `Pitch: ${p.pitch}`);
  if (p.bio) profileLines.push('', `Summary: ${p.bio}`);
  out.push(...section('Profile', profileLines));

  const exp = data.experience || [];
  if (exp.length) {
    out.push('## Experience', '');
    for (const e of exp) {
      out.push(`### ${e.role}, ${e.company} (${e.period})`, '');
      if (e.location) out.push(`Location: ${e.location}`, '');
      const lines = descriptionLines(e.description);
      if (lines.some(Boolean)) out.push(...lines, '');
    }
  }

  const edu = data.education || [];
  out.push(
    ...section(
      'Education',
      edu.map((e) => {
        const dates = [e.start, e.end].filter(Boolean).join(' – ');
        let line = `- ${[e.degree, e.school].filter(Boolean).join(', ')}`;
        if (dates) line += ` (${dates})`;
        if (e.notes) line += `. ${e.notes}`;
        if (e.activities) line += `. Activities: ${e.activities}`;
        return line;
      }),
    ),
  );

  out.push(
    ...section(
      'Skills',
      Object.entries(data.skills || {}).map(([cat, list]) => `- ${cat}: ${list.join(', ')}`),
    ),
  );

  out.push(
    ...section(
      'Certifications',
      (data.certifications || []).map((c) => {
        let line = `- ${c.title}`;
        if (c.issuer) line += `, ${c.issuer}`;
        if (c.date) line += ` (${c.date})`;
        if (c.url) line += `: ${c.url}`;
        return line;
      }),
    ),
  );

  const projects = data.featuredProjects || [];
  if (projects.length) {
    out.push('## Featured projects (personal, open source on GitHub)', '');
    if (p.github) out.push(`All repositories are under ${p.github.replace(/\/?$/, '/')}.`, '');
    for (const pr of projects) {
      const named =
        pr.title && pr.name && pr.title.toLowerCase() !== pr.name.toLowerCase()
          ? `${pr.name}: ${pr.title}`
          : pr.name || pr.title;
      out.push(`### ${named}${pr.language ? ` (${pr.language})` : ''}`, '');
      if (pr.html_url) out.push(pr.html_url, '');
      if (pr.description) out.push(pr.description, '');
      if (pr.problem) out.push(`- Problem: ${pr.problem}`);
      if (pr.built) out.push(`- Built: ${pr.built}`);
      if (pr.stack?.length) out.push(`- Stack: ${pr.stack.join(', ')}`);
      if (pr.topics?.length) out.push(`- Topics: ${pr.topics.join(', ')}`);
      if (pr.problem || pr.built || pr.stack?.length || pr.topics?.length) out.push('');
    }
  }

  const extraBody = String(extra)
    .replace(/\r\n?/g, '\n')
    .replace(/^\s*<!--[\s\S]*?-->\s*/, '')
    .trim();
  if (extraBody) out.push(extraBody, '');

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

async function generate() {
  const data = JSON.parse(await readFile(PATHS.data, 'utf8'));
  let extra = '';
  try {
    extra = await readFile(PATHS.extra, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  return buildKnowledge(data, extra);
}

async function readCurrent() {
  try {
    return await readFile(PATHS.out, 'utf8');
  } catch {
    return null;
  }
}

/** Writes knowledge.md; resolves to true when the file changed. */
export async function writeKnowledge() {
  const next = await generate();
  if ((await readCurrent()) === next) return false;
  await writeFile(PATHS.out, next, 'utf8');
  return true;
}

async function main(args) {
  if (args.includes('--check')) {
    if ((await readCurrent()) !== (await generate())) {
      console.error('chat-proxy/knowledge.md is out of date. Run `npm run knowledge` and commit the result.');
      return 1;
    }
    console.log('chat-proxy/knowledge.md is up to date.');
    return 0;
  }
  const changed = await writeKnowledge();
  console.log(`chat-proxy/knowledge.md: ${changed ? 'regenerated' : 'up to date'}`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}
