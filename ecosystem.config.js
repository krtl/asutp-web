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
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "dbisertor",
      script:
        "D:\\javascript\\asutp-web-vs.code\\server\\serviceDbInsertor\\serviceDbInsertor.js",
      args: "",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "server",
      script: "server.js",
      args: "",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 80
      }
    }
  ]
};
