import {spawn} from 'node:child_process';
import {cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {resolve, relative} from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import yaml from 'yaml';

const root = resolve(import.meta.dirname, '..');
const delivery = resolve(root, 'delivery');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const walk = async (directory) => {
  const {readdir} = await import('node:fs/promises');
  const entries = await readdir(directory, {withFileTypes: true});
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(resolve(directory, entry.name)) : [resolve(directory, entry.name)]))).flat();
};
const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
const invoke = (args) => new Promise((resolve, reject) => {
  const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', `npm ${args.join(' ')}`] : args;
  const child = spawn(command, commandArgs, {stdio: 'inherit'});
  child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${args.join(' ')} failed with ${code}`)));
});
if (process.argv.includes('--site')) {
  await invoke(['run', 'validate']);
  await invoke(['run', 'progress']);
  await invoke(['run', 'build:site']);
  await invoke(['run', 'build:search']);
  console.log('Static documentation site and Pagefind index built.');
}

if (process.argv.includes('--bundle')) {
  await invoke(['run', 'validate']);
  await invoke(['run', 'progress']);
  await rm(delivery, {recursive: true, force: true});
  const contentRoot = resolve(delivery, 'content');
  await mkdir(contentRoot, {recursive: true});
  const assets = (yaml.parse(await readFile(resolve(root, 'catalog/assets.yml'), 'utf8'))?.assets ?? []);
  const files = (await walk(resolve(root, 'docs'))).filter((file) => file.endsWith('.md'));
  const documents = [];
  for (const file of files) {
    const parsed = matter(await readFile(file, 'utf8'));
    if (parsed.data.status !== 'published') continue;
    const sourcePath = `documents/${parsed.data.id}.md`;
    const target = resolve(contentRoot, sourcePath);
    await mkdir(resolve(target, '..'), {recursive: true});
    await writeFile(target, parsed.content.trimStart(), 'utf8');
    const matchingAssets = assets.filter((asset) => asset.used_by?.includes(parsed.data.id));
    const manifestAssets = [];
    for (const asset of matchingAssets) {
      const source = resolve(root, asset.path);
      const publishedPath = `assets/${asset.path.split('/').at(-1)}`;
      await mkdir(resolve(contentRoot, 'assets'), {recursive: true});
      await cp(source, resolve(contentRoot, publishedPath));
      const bytes = await readFile(source);
      manifestAssets.push({source_path: publishedPath, sha256: sha256(bytes), title: asset.title, alt: asset.alt, source: asset.source, license: asset.license});
    }
    documents.push({
      id: parsed.data.id,
      version: parsed.data.document_version,
      locale: parsed.data.locale,
      title: parsed.data.title,
      scope_type: parsed.data.document_type === 'algorithm' ? 'algorithm' : 'platform',
      scope_key: parsed.data.document_type === 'algorithm' ? parsed.data.related_operators?.[0] : parsed.data.id,
      doc_kind: 'reference',
      related_operators: parsed.data.related_operators ?? [],
      source_path: sourcePath,
      sha256: sha256(Buffer.from(parsed.content.trimStart(), 'utf8')),
      assets: manifestAssets,
    });
  }
  const gitValue = async (args) => new Promise((resolveResult) => {
    const child = spawn('git', args, {cwd: root}); let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; }); child.on('close', () => resolveResult(output.trim()));
  });
  const commit = process.env.GITHUB_SHA ?? await gitValue(['rev-parse', 'HEAD']);
  const publishedAt = await gitValue(['show', '-s', '--format=%cI', 'HEAD']);
  const tag = process.env.DOCS_PUBLICATION_TAG ?? 'unapproved-local-build';
  const manifest = {schema_version: '1.0', publication: {tag, commit, published_at: publishedAt, progress_included: !process.argv.includes('--exclude-progress')}, documents};
  await writeFile(resolve(delivery, 'publication-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Prepared ${documents.length} documents for publication bundle (${relative(root, delivery)}).`);
}
