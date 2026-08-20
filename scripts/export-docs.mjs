import {execFileSync} from 'node:child_process';
import {cp, mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import yaml from 'yaml';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const ref = args.includes('--ref') ? args[args.indexOf('--ref') + 1] : 'HEAD';
const formats = (args.includes('--formats') ? args[args.indexOf('--formats') + 1] : 'html').split(',');
const includeProgress = !args.includes('--exclude-progress');
const delivery = resolve(root, 'delivery');
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const run = (command, commandArgs) => execFileSync(command, commandArgs, {cwd: root, stdio: 'inherit'});

const head = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
if (ref !== 'HEAD' && ref !== head) {
  const worktree = await mkdtemp(resolve(tmpdir(), 'smart-water-docs-export-'));
  const childArgs = args.filter((value, index) => value !== '--ref' && args[index - 1] !== '--ref');
  try {
    execFileSync('git', ['worktree', 'add', '--detach', worktree, ref], {cwd: root, stdio: 'inherit'});
    execFileSync(process.execPath, ['scripts/export-docs.mjs', '--ref', 'HEAD', ...childArgs], {cwd: worktree, stdio: 'inherit'});
    await rm(delivery, {recursive: true, force: true});
    await cp(resolve(worktree, 'delivery'), delivery, {recursive: true});
    console.log(`Delivery export restored from immutable ref ${ref}.`);
  } finally {
    try { execFileSync('git', ['worktree', 'remove', '--force', worktree], {cwd: root, stdio: 'ignore'}); }
    catch { await rm(worktree, {recursive: true, force: true}); }
  }
  process.exit(0);
}
run('node', ['scripts/build-publication.mjs', '--bundle', ...(includeProgress ? [] : ['--exclude-progress'])]);
if (formats.includes('html')) {
  run(process.platform === 'win32' ? 'cmd.exe' : 'npm', process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run build'] : ['run', 'build']);
  await cp(resolve(root, 'build'), resolve(delivery, 'offline-html'), {recursive: true});
}
const book = yaml.parse(await readFile(resolve(root, 'catalog/book.yml'), 'utf8'));
const chapters = [];
for (const path of book.chapters) chapters.push(matter(await readFile(resolve(root, path), 'utf8')).content.trim());
await writeFile(resolve(delivery, 'smart-water-platform-complete.md'), `# ${book.title}\n\n${chapters.join('\n\n\\newpage\n\n')}\n`, 'utf8');
for (const format of formats.filter((item) => item === 'pdf' || item === 'docx')) {
  try { run('pandoc', [resolve(delivery, 'smart-water-platform-complete.md'), '-o', resolve(delivery, `smart-water-platform-complete.${format}`), ...(format === 'pdf' ? ['--pdf-engine=xelatex'] : [])]); }
  catch { throw new Error(`Pandoc/XeLaTeX export failed for ${format}; use the pinned export container.`); }
}
const outputFiles = [];
const {readdir, stat} = await import('node:fs/promises');
const collect = async (directory) => { for (const entry of await readdir(directory, {withFileTypes: true})) { const file = resolve(directory, entry.name); if (entry.isDirectory()) await collect(file); else outputFiles.push(file); } };
await collect(delivery);
await writeFile(resolve(delivery, 'SHA256SUMS'), `${(await Promise.all(outputFiles.filter((file) => !file.endsWith('SHA256SUMS')).map(async (file) => `${sha(await readFile(file))}  ${file.slice(delivery.length + 1).replaceAll('\\\\', '/')}`))).join('\n')}\n`);
console.log(`Delivery export for ${ref} is available under delivery/.`);
