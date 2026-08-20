import {readdir, readFile} from 'node:fs/promises';
import {resolve, relative} from 'node:path';
import process from 'node:process';
import Ajv2020 from 'ajv/dist/2020.js';
import matter from 'gray-matter';

const root = resolve(import.meta.dirname, '..');
const schema = JSON.parse(await readFile(resolve(root, 'schemas/document.schema.json'), 'utf8'));
const validate = new Ajv2020({allErrors: true}).compile(schema);
const terminology = (await import('yaml')).default.parse(await readFile(resolve(root, 'catalog/terminology.yml'), 'utf8'));
const requiredTerms = new Set(terminology.terms.map((item) => item.zh));
const walk = async (directory) => {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(entries.map(async (entry) => entry.isDirectory() ? walk(resolve(directory, entry.name)) : [resolve(directory, entry.name)]));
  return nested.flat();
};
const documents = (await walk(resolve(root, 'docs'))).filter((file) => /\.mdx?$/.test(file) && !file.includes('tutorial-') && !file.endsWith('intro.mdx'));
const ids = new Map();
const failures = [];
for (const file of documents) {
  const source = await readFile(file, 'utf8');
  const parsed = matter(source);
  if (parsed.data.reviewed_at instanceof Date) parsed.data.reviewed_at = parsed.data.reviewed_at.toISOString().slice(0, 10);
  if (!validate(parsed.data)) failures.push(`${relative(root, file)}: ${validate.errors?.map((error) => error.message).join('; ')}`);
  if (parsed.data.id) {
    if (ids.has(parsed.data.id)) failures.push(`${relative(root, file)}: duplicate document id ${parsed.data.id}`);
    ids.set(parsed.data.id, file);
  }
  if (parsed.data.status === 'published' && !parsed.content.trim()) failures.push(`${relative(root, file)}: published document is empty`);
}
if (documents.length === 0) failures.push('No formal document found under docs/.');
if (requiredTerms.size === 0) failures.push('Terminology catalog is empty.');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Validated ${documents.length} published-document candidates and ${ids.size} stable IDs.`);
