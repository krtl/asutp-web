module.exports = {
  apps: [
    {
      name: "logger",
      script:
        "/var/projects/asutp-web/server/serviceLogger/serviceLogger.js",
      args: "",
      instances: 1,
      autorestart: true,
      watch: true,
      watch_delay: 10000,
      ignore_watch: ["node_modules", "logs", "data", "client"],
      exp_backoff_restart_delay: 10000,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      },
      error_file: "/var/projects/asutp-web/asutp-web.logs/Logger_err.log",
      out_file: "/var/projects/asutp-web/asutp-web.logs/Logger_out.log",
      log_file: "/var/projects/asutp-web/asutp-web.logs/Logger_combined.log",
      time: true
    },
    {
      name: "dbisertor",
      script:
        "/var/projects/asutp-web/server/serviceDbInsertor/serviceDbInsertor.js",
      args: "",
      instances: 1,
      autorestart: true,
      watch: true,
      watch_delay: 60000,
      ignore_watch: ["node_modules", "logs", "data", "client"],
      exp_backoff_restart_delay: 10000,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      },
      error_file: "/var/projects/asutp-web/asutp-web.logs/Insertor_err.log",
      out_file: "/var/projects/asutp-web/asutp-web.logs/Insertor_out.log",
      log_file: "/var/projects/asutp-web/asutp-web.logs/Insertor_combined.log",
      time: true
    },
    {
      name: "server",
      script: "server.js",
      args: "",
      instances: 1,
      autorestart: true,
      watch: true,
      watch_delay: 30000,
      ignore_watch: ["node_modules", "logs", "data", "client"],
      exp_backoff_restart_delay: 10000,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      error_file: "/var/projects/asutp-web/asutp-web.logs/Server_err.log",
      out_file: "/var/projects/asutp-web/asutp-web.logs/Server_out.log",
      log_file: "/var/projects/asutp-web/asutp-web.logs/Server_combined.log",
      time: true
    }
  ]
};
