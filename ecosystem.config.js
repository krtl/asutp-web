module.exports = {
  apps: [
    {
      name: "logger",
      script:
        "D:\\javascript\\asutp-web-vs.code\\server\\serviceLogger\\serviceLogger.js",
      args: "",
      instances: 1,
      autorestart: true,
      watch: true,
      watch_delay: 10000,
      ignore_watch: ["node_modules", "logs"],
      exp_backoff_restart_delay: 1000,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      },
      error_file: "Logger_err.log",
      out_file: "Logger_out.log",
      log_file: "Logger_combined.log",
      time: true
    },
    {
      name: "dbisertor",
      script:
        "D:\\javascript\\asutp-web-vs.code\\server\\serviceDbInsertor\\serviceDbInsertor.js",
      args: "",
      instances: 1,
      autorestart: true,
      watch: true,
      watch_delay: 60000,
      ignore_watch: ["node_modules", "logs"],
      exp_backoff_restart_delay: 10000,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      },
      error_file: "Insertor_err.log",
      out_file: "Insertor_out.log",
      log_file: "Insertor_combined.log",
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
      ignore_watch: ["node_modules", "logs"],
      exp_backoff_restart_delay: 10000,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 80
      },
      error_file: "Server_err.log",
      out_file: "Server_out.log",
      log_file: "Server_combined.log",
      time: true
    }
  ]
};
