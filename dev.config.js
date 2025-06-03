module.exports = {
  apps: [
    {
      name: "clustered-ost",
      script: "./clustered-ost.js",
      watch: true,
      node_args: "-r dotenv/config",
      args: "dotenv_config_path=./.env.development"
    },
    // {
    //   name: "socket-app",
    //   script: "./socket-app.js",
    //   watch: true,
    //   node_args: "-r dotenv/config",
    //   args: "dotenv_config_path=./.env.development"
    // }
  ]
};ss