module.exports = {
  apps: [
    {
      name: 'usdt-inr-backend',
      script: './backend/dist/main.js',
      cwd: '/var/www/usdt-inr',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/usdt-inr/backend-error.log',
      out_file: '/var/log/usdt-inr/backend-out.log',
      log_file: '/var/log/usdt-inr/backend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'usdt-inr-admin',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/usdt-inr/admin',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_BACKEND_URL: 'http://localhost:3001'
      },
      error_file: '/var/log/usdt-inr/admin-error.log',
      out_file: '/var/log/usdt-inr/admin-out.log',
      log_file: '/var/log/usdt-inr/admin-combined.log',
      time: true
    },
    {
      name: 'usdt-inr-buy-site',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/usdt-inr/buy-site',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/var/log/usdt-inr/buy-site-error.log',
      out_file: '/var/log/usdt-inr/buy-site-out.log',
      log_file: '/var/log/usdt-inr/buy-site-combined.log',
      time: true
    },
    {
      name: 'usdt-inr-sell-site',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/usdt-inr/sell-site',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: '/var/log/usdt-inr/sell-site-error.log',
      out_file: '/var/log/usdt-inr/sell-site-out.log',
      log_file: '/var/log/usdt-inr/sell-site-combined.log',
      time: true
    }
  ]
};
