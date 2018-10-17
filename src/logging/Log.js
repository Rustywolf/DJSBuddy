const Module = require('../module/Module');
const Winston = require('winston');

module.exports = class Log extends Module {

  constructor(buddy) {
    super(buddy);
  }

  run() {
    this.logger = Winston.createLogger({
      level: "debug",
      format: Winston.format.combine(
        Winston.format.timestamp(),
        Winston.format.printf(info => {
          return `[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message}`;
        })
      ),
      transports: [
        new Winston.transports.Console(),
        new Winston.transports.File({
          filename: "./logs/" + Date.now() + ".log"
        })
      ]
    });

    this.ready();
  }

  error(e) {
    this.logger.error(e.stack ? e.stack : e);
  }

  warn(msg) {
    this.logger.warn(msg);
  }

  info(msg) {
    this.logger.info(msg);
  }

  verbose(msg) {
    this.logger.verbose(msg);
  }

  debug(msg) {
    this.logger.debug(msg);
  }
}