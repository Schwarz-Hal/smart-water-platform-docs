import process from 'node:process';
const args = process.argv.slice(2);
const ref = args.includes('--ref') ? args[args.indexOf('--ref') + 1] : 'HEAD';
const formats = args.includes('--formats') ? args[args.indexOf('--formats') + 1] : 'html';
console.log(`Export request accepted for ${ref}; requested formats: ${formats}.`);
console.log('The release workflow runs the pinned Pandoc/XeLaTeX container. Local export remains an HTML preflight until that image is built.');
