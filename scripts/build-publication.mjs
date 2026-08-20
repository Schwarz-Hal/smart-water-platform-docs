import {spawn} from 'node:child_process';
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
