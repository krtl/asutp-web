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
      ignore_watch: ["node_modules", "logs", "data", "client"],
      exp_backoff_restart_delay: 10000,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      },
      error_file: "../asutp-web-vs.code.logs/Logger_err.log",
      out_file: "../asutp-web-vs.code.logs/Logger_out.log",
      log_file: "../asutp-web-vs.code.logs/Logger_combined.log",
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
      ignore_watch: ["node_modules", "logs", "data", "client"],
      exp_backoff_restart_delay: 10000,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      },
      error_file: "../asutp-web-vs.code.logs/Insertor_err.log",
      out_file: "../asutp-web-vs.code.logs/Insertor_out.log",
      log_file: "../asutp-web-vs.code.logs/Insertor_combined.log",
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
        PORT: 80
      },
      error_file: "../asutp-web-vs.code.logs/Server_err.log",
      out_file: "../asutp-web-vs.code.logs/Server_out.log",
      log_file: "../asutp-web-vs.code.logs/Server_combined.log",
      time: true
    }
  ]
};
