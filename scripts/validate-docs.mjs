import {readdir, readFile} from 'node:fs/promises';
import {resolve, relative} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import matter from 'gray-matter';
import YAML from 'yaml';

const root = resolve(import.meta.dirname, '..');

// These are the headings required by the matching templates. `development`
// is the repository's existing name for API integration documents.
export const REQUIRED_SECTIONS = {
  algorithm: ['用途与适用范围', '输入与输出', '原理与关键公式', '参数说明', '结果解释与限制', '参考资料'],
  api: ['用途与权限', '请求', '响应', '错误与重试'],
  development: ['用途与权限', '请求', '响应', '错误与重试'],
  operations: ['前置条件', '检查', '操作步骤', '验证与回退'],
  user_guide: ['用途', '前置条件与角色', '操作步骤', '结果与失败处理']
};

const SECTION_MATCHERS = {
  '用途与适用范围': (h) => h.includes('用途') && (h.includes('适用范围') || h.includes('适用场景') || h.includes('概览')),
  '输入与输出': (h) => h.includes('输入') && h.includes('输出'),
  '原理与关键公式': (h) => h.includes('原理') || h.includes('模型架构') || h.includes('数学定义') || h.includes('关键公式'),
  '参数说明': (h) => h.includes('参数'),
  '结果解释与限制': (h) => (h.includes('结果') || h.includes('输出')) && (h.includes('解释') || h.includes('限制') || h.includes('局限')),
  '参考资料': (h) => h.includes('参考'),
  '用途与权限': (h) => h.includes('用途') && (h.includes('权限') || h.includes('鉴权')),
  请求: (h) => h.includes('请求'),
  响应: (h) => h.includes('响应'),
  '错误与重试': (h) => (h.includes('错误') || h.includes('失败')) && (h.includes('重试') || h.includes('处理')),
  前置条件: (h) => h.includes('前置条件'),
  检查: (h) => h.includes('检查') || h.includes('健康'),
  操作步骤: (h) => h.includes('操作步骤') || h.includes('操作流程') || h.includes('执行'),
  '验证与回退': (h) => (h.includes('验证') || h.includes('核验')) && (h.includes('回退') || h.includes('回滚') || h.includes('恢复')),
  用途: (h) => h.includes('用途'),
  '前置条件与角色': (h) => h.includes('前置条件') && (h.includes('角色') || h.includes('权限')),
  '结果与失败处理': (h) => (h.includes('结果') || h.includes('输出')) && (h.includes('失败') || h.includes('排障') || h.includes('处理'))
};

const normalizeHeading = (heading) => heading
  .replace(/^\s*\d+(?:\.\d+)*[.、)）:]?\s*/, '')
  .replace(/[`*_~]/g, '')
  .trim()
  .toLowerCase();

export function extractHeadings(markdown) {
  return [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match) => normalizeHeading(match[1]));
}

export function missingRequiredSections(documentType, markdown) {
  const required = REQUIRED_SECTIONS[documentType] ?? [];
  const headings = extractHeadings(markdown);
  return required.filter((section) => !headings.some((heading) => SECTION_MATCHERS[section](heading)));
}

const EVIDENCE_MARKER = /<!--\s*evidence:\s*([^>]+?)\s*-->/i;
const EVIDENCE_FIELDS = new Set(['run_id', 'trace_id', 'commit', 'report', 'reviewer', 'date', 'link']);
const PLACEHOLDER = /^(?:待填写|todo|tbd|unknown|n\/a|<[^>]+>)$/i;

function parseEvidenceMarker(line) {
  const match = line.match(EVIDENCE_MARKER);
  if (!match) return null;
  const fields = new Map();
  for (const part of match[1].split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const key = part.slice(0, separator).trim().toLowerCase();
    const value = part.slice(separator + 1).trim();
    if (EVIDENCE_FIELDS.has(key) && value && !PLACEHOLDER.test(value)) fields.set(key, value);
  }
  return fields;
}

export function checkedItemsWithoutEvidence(markdown) {
  const failures = [];
  markdown.split(/\r?\n/).forEach((line, index) => {
    if (!/-\s*\[[xX]\]/.test(line)) return;
    const evidence = parseEvidenceMarker(line);
    const hasIdentityOrLink = evidence && ['run_id', 'trace_id', 'commit', 'report', 'link'].some((key) => evidence.has(key));
    if (!hasIdentityOrLink) failures.push({line: index + 1, text: line.trim()});
  });
  return failures;
}

export function isStrictCandidate(frontMatter, backlogStatus) {
  return frontMatter.status === 'published' && backlogStatus === 'ready';
}

const BACKLOG_STATUS_KEYS = ['ready', 'expand', 'missing', 'deferred'];

export function backlogStatusCounts(entries) {
  return entries.reduce((counts, entry) => {
    if (BACKLOG_STATUS_KEYS.includes(entry.status)) counts[entry.status] += 1;
    return counts;
  }, {ready: 0, expand: 0, missing: 0, deferred: 0});
}

export function backlogSummaryFailures(summary, entries) {
  const counts = backlogStatusCounts(entries);
  const failures = [];
  const expectedTotal = entries.length;
  if (summary.total !== expectedTotal) failures.push(`backlog summary total ${summary.total} does not match ${expectedTotal} entries`);
  for (const status of BACKLOG_STATUS_KEYS) {
    if (summary[status] !== counts[status]) failures.push(`backlog summary ${status} ${summary[status]} does not match ${counts[status]} entries`);
  }
  return failures;
}

export function documentBacklogFailures(displayPath, frontMatter, entry) {
  if (!entry) return [`${displayPath}: no matching backlog path`];
  const failures = [];
  if (entry.id !== frontMatter.id) failures.push(`${displayPath}: backlog id ${entry.id} does not match front matter id ${frontMatter.id}`);
  if (String(entry.version) !== String(frontMatter.document_version)) {
    failures.push(`${displayPath}: backlog version ${entry.version} does not match document_version ${frontMatter.document_version}`);
  }
  return failures;
}

const walk = async (directory) => {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(entries.map(async (entry) => entry.isDirectory() ? walk(resolve(directory, entry.name)) : [resolve(directory, entry.name)]));
  return nested.flat();
};

export async function validateRepository({repositoryRoot = root} = {}) {
  const schema = JSON.parse(await readFile(resolve(repositoryRoot, 'schemas/document.schema.json'), 'utf8'));
  const validateSchema = new Ajv2020({allErrors: true}).compile(schema);
  const terminology = YAML.parse(await readFile(resolve(repositoryRoot, 'catalog/terminology.yml'), 'utf8'));
  const requiredTerms = new Set(terminology.terms.map((item) => item.zh));
  const backlog = YAML.parse(await readFile(resolve(repositoryRoot, 'catalog/document-backlog.yml'), 'utf8'));
  const backlogEntries = (backlog.areas ?? []).flatMap((area) => (area.documents ?? []).map((document) => ({...document, path: document.path.replaceAll('\\', '/')})));
  const backlogByPath = new Map(backlogEntries.map((document) => [document.path, document]));
  const documents = (await walk(resolve(repositoryRoot, 'docs'))).filter((file) => /\.mdx?$/.test(file) && !file.includes('tutorial-') && !file.endsWith('intro.mdx'));
  const ids = new Map();
  const failures = [];
  for (const file of documents) {
    const source = await readFile(file, 'utf8');
    const parsed = matter(source);
    if (parsed.data.reviewed_at instanceof Date) parsed.data.reviewed_at = parsed.data.reviewed_at.toISOString().slice(0, 10);
    const displayPath = relative(repositoryRoot, file).replaceAll('\\', '/');
    if (!validateSchema(parsed.data)) failures.push(`${displayPath}: ${validateSchema.errors?.map((error) => error.message).join('; ')}`);
    if (parsed.data.id) {
      if (ids.has(parsed.data.id)) failures.push(`${displayPath}: duplicate document id ${parsed.data.id}`);
      ids.set(parsed.data.id, file);
    }
    failures.push(...documentBacklogFailures(displayPath, parsed.data, backlogByPath.get(displayPath)));
    if (parsed.data.status === 'published' && !parsed.content.trim()) failures.push(`${displayPath}: published document is empty`);
    for (const item of checkedItemsWithoutEvidence(parsed.content)) failures.push(`${displayPath}:${item.line}: checked acceptance item has no structured evidence marker`);
    if (isStrictCandidate(parsed.data, backlogByPath.get(displayPath)?.status)) {
      const missing = missingRequiredSections(parsed.data.document_type, parsed.content);
      if (missing.length) failures.push(`${displayPath}: ready candidate is missing required sections: ${missing.join(', ')}`);
    }
  }
  failures.push(...backlogSummaryFailures(backlog.summary ?? {}, backlogEntries));
  if (documents.length === 0) failures.push('No formal document found under docs/.');
  if (requiredTerms.size === 0) failures.push('Terminology catalog is empty.');
  return {documents, ids, failures};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await validateRepository();
  if (result.failures.length) { console.error(result.failures.join('\n')); process.exit(1); }
  console.log(`Validated ${result.documents.length} formal documents and ${result.ids.size} stable IDs.`);
}
