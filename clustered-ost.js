require("dotenv").config();

const fs = require("fs");
const https = require("https");
const conf = require("./config");
const app = require("./app");
const Log = require("./models/logsModel");

const https_agent = new https.Agent({ keepAlive: true });
https_agent.maxSockets = "Infinity";

var server;
const port = process.env.PORT;

if (conf.env && conf.env !== "local") {
  const optionPaths = conf.optionFiles[conf.env];
  const key = fs.readFileSync(optionPaths.key);
  const cert = fs.readFileSync(optionPaths.cert);
  const ca = fs.readFileSync(optionPaths.ca);

  server = https.createServer({ key, cert, ca }, app);
} else if (conf.env && conf.env === "local") {
  server = https.createServer(app);
}

app.use(async (req, res, next) => {
  const oldSend = res.send;

  res.send = async function (data) {
    res.send = oldSend;
    res.send(data);

    const log = new Log({
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
      },
      response: {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body: data
      }
    });

    await log.save();
  };
  next();
});

server.on("error", (error) => {
  console.error("Server Error:", error);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

app.listen(port, () => {
  console.log(`Worker process ${process.pid} is listening on port:${port}`);
});
