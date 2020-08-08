const {spawn} = require('child_process');

const exec = (cmd, args = [], options = {}, stdio = ['inherit', 'inherit', 'inherit']) => new Promise((resolve, reject) => {
  console.log(`Started: ${cmd} ${args.join(' ')}`);
  const optionsToCLI = {
    ...options,
    stdio
  };
  const app = spawn(cmd, args, optionsToCLI);
  app.on('close', (code) => {
    if (code !== 0) {
      const err = new Error(`Invalid status code: ${code}`);
      err.code = code;
      return reject(err);
    }
    return resolve(code);
  });
  app.on('error', reject);
});

module.exports = exec;
