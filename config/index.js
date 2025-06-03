require("dotenv").config();

module.exports = {
  optionFiles: {
    development: {
      key: "/etc/httpd/ssl/ost-platform/ephrontech.key",
      cert: "/etc/httpd/ssl/ost-platform/ephrontech.crt",
      ca: "/etc/httpd/ssl/ost-platform/gd_ephrontech.crt"
    },
    staging: {
      key: "/etc/httpd/ssl/stagingapi.key",
      cert: "/etc/httpd/ssl/stagingapi.crt",
      ca: "/etc/httpd/ssl/gd_stagingapi.crt"
    },
    production: {
      key: "/etc/httpd/ssl/ost-platform.com/api.ostsss-platform.com.key",
      cert: "/etc/httpd/ssl/ost-platform.com/api.ost-platform.com.crt",
      ca: "/etc/httpd/ssl/ost-platform.com/gd_api.ost-platform.com.crt"
    }
  },
  apnKeyPaths: {
    development: "/home/dev-ost-platform/public_html/myapp/AuthKey_T46KDVML32.p8",
    staging: "/home/ost-platform_staging/public_html/myapp/AuthKey_T46KDVML32.p8",
    production: "/home/dev-ost-platform-production/public_html/myapp/AuthKey_T46KDVML32.p8",
    local: "./AuthKey_T46KDVML32.p8"
  },
  socketPort: process.env.SOCKET_PORT,
  env: process.env.ENVIRONMENT,
  secretNames: {
    local: "DevelopementKeys",
    development: "DevelopementKeys",
    staging: "StagingKeys",
    production: "LiveKeys"
  }
};
