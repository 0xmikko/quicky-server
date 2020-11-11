
module.exports = {
  apps : [{
    name: "quicky-server",
    script: "./build/index.js",
    node_args: "-r dotenv/config",
    instances: "max",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
