const {spawn} = require('child_process');

const exec = (cmd, args = [], options = {}) => new Promise((resolve, reject) => {
  const optionsToCLI = {
    ...options
  };
  if (!optionsToCLI.stdio) {
    Object.assign(optionsToCLI, {stdio: ['inherit', 'inherit', 'inherit']});
  }
  const app = spawn(cmd, args, optionsToCLI);
  app.on('close', (code) => {
    if (code !== 0) {
      console.log(`Error on: ${cmd} ${args.join(' ')}`);
      const err = new Error(`Invalid status code: ${code}`);
      err.code = code;
      return reject(err);
    }
    return resolve(code);
  });
  app.on('error', reject);
});

module.exports = exec;
