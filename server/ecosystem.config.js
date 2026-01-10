module.exports = {
    apps: [
        {
            name: 'vouch-server',
            script: 'dist/index.js',
            cwd: '/var/www/vouch-server/server',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
            error_file: '/var/log/pm2/vouch-server-error.log',
            out_file: '/var/log/pm2/vouch-server-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        },
    ],
};
