module.exports = {
  apps: [{
    name: 'thiago-site-pessoal',
    script: './server.js',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '200M',
    time: true
  }]
};
