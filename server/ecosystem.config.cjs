module.exports = {
  apps: [
    {
      name: 'vyas-sweets-api',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Logs go to these files on EC2
      out_file: '/home/ubuntu/logs/api-out.log',
      error_file: '/home/ubuntu/logs/api-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
