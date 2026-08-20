import {execFileSync} from 'node:child_process';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import YAML from 'yaml';

const root = resolve(import.meta.dirname, '..');
const catalog = YAML.parse(await readFile(resolve(root, 'catalog/modules.yml'), 'utf8'));
const weights = {implementation: .35, tests: .2, integration: .15, user_docs: .1, api_docs: .1, deployment: .1};
const states = {none: 0, partial: .5, complete: 1};
const score = (evidence) => Object.entries(weights).reduce((sum, [key, weight]) => sum + (states[evidence[key] ?? 'none'] * weight), 0);
const modules = catalog.modules.filter((item) => item.included).map((item) => ({...item, completion: score(item.evidence)}));
const complexity = modules.reduce((sum, item) => sum + item.complexity, 0);
const total = complexity === 0 ? 0 : modules.reduce((sum, item) => sum + item.complexity * item.completion, 0) / complexity;
const generatedAt = process.env.DOCS_PROGRESS_TIMESTAMP ?? execFileSync('git', ['show', '-s', '--format=%cI', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
const output = {generated_at: generatedAt, progress: catalog.progress, total, modules};
await mkdir(resolve(root, 'src/generated'), {recursive: true});
await writeFile(resolve(root, 'src/generated/progress.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Calculated progress: ${(total * 100).toFixed(1)}% across ${modules.length} modules.`);
