module.exports = {
  apps: [
    {
      name: "clustered-tilted",
      script: "./clustered-tilted.js",
      watch: true,
      node_args: "-r dotenv/config",
      args: "dotenv_config_path=./.env.local"
    }
  ]
};
