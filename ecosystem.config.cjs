module.exports = {
  apps: [
    {
      name: 'oliver_bot',
      script: './dist/index.js',
      cwd: '/home/ubuntu/oliver_bot',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      combine_logs: true,
    },
  ],
};
