import process from 'node:process';
const tag = process.argv[2];
if (!tag || !/^docs-(snapshot|milestone|release)-[A-Za-z0-9._-]+$/.test(tag)) {
  throw new Error('Usage: npm run snapshot -- docs-snapshot-YYYY-MM-DD');
}
console.log(`Snapshot validation passed for ${tag}. Create and publish the immutable tag through GitHub Actions.`);
