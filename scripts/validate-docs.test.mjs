import test from 'node:test';
import assert from 'node:assert/strict';
import {backlogSummaryFailures, checkedItemsWithoutEvidence, documentBacklogFailures, isStrictCandidate, missingRequiredSections} from './validate-docs.mjs';

test('a complete algorithm document covers all six template sections', () => {
  const markdown = `
## 用途与适用范围
## 输入与输出
## 原理与关键公式
## 参数说明
## 结果解释与限制
## 参考资料
`;
  assert.deepEqual(missingRequiredSections('algorithm', markdown), []);
});

test('a ready algorithm candidate reports missing template sections', () => {
  const markdown = `
## 用途与适用范围
## 输入与输出
## 参数说明
## 参考资料
`;
  assert.deepEqual(missingRequiredSections('algorithm', markdown), ['原理与关键公式', '结果解释与限制']);
});

test('a checked item without structured evidence fails', () => {
  assert.equal(checkedItemsWithoutEvidence('- [x] 已完成验收步骤').length, 1);
  assert.equal(checkedItemsWithoutEvidence('- [x] 已完成验收步骤 <!-- evidence: run_id=run-123; report=https://example.test/report -->').length, 0);
});

test('expand remains non-strict while ready invokes the section gate', () => {
  const incomplete = '## 用途与适用范围\n';
  assert.equal(isStrictCandidate({status: 'draft'}, 'ready'), false);
  assert.equal(isStrictCandidate({status: 'published'}, 'expand'), false);
  assert.equal(isStrictCandidate({status: 'published'}, 'ready'), true);
  assert.notDeepEqual(missingRequiredSections('algorithm', incomplete), []);
});

test('document and backlog version mismatch is reported', () => {
  const failures = documentBacklogFailures('docs/example.md', {id: 'example', document_version: '1.0.0'}, {id: 'example', version: '1.1.0', status: 'expand'});
  assert.match(failures.join('\n'), /version 1\.1\.0 does not match document_version 1\.0\.0/);
});

test('backlog summary counts must match its entries', () => {
  const failures = backlogSummaryFailures({total: 2, ready: 2, expand: 0, missing: 0, deferred: 0}, [
    {status: 'ready'},
    {status: 'expand'}
  ]);
  assert.match(failures.join('\n'), /summary ready 2 does not match 1 entries/);
  assert.match(failures.join('\n'), /summary expand 0 does not match 1 entries/);
});
