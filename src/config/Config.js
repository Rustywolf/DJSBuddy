const fs = require('fs');
const Module = require('../module/Module');
const ConfigSection = require('./ConfigSection');

module.exports = class Config extends Module {

  constructor(buddy) {
    super(buddy);
    this.data = null;
    this.marked = false;
    this.attempt = 1;

    this.defaultData = {
      commands: {
        symbols: {

        },

        disabled: {
          channels: {},
          guilds: {}
        }
      },

      ext: {

      }
    };
  }

  run() {
    this.load();
  }

  load() {
    fs.readFile("./config.json", (e, data) => {
      if (e) {
        if (e.code === "ENOENT") {
          this.create();
        } else {
          this.error(e);
        }
      } else {
        this.parse(data);
      }
    });
  }

  create() {
    this.data = this.defaultData;

    fs.writeFile("./config.json", this.configToJson(), (e) => {
      if (e) {
        this.error(e);
      } else {
        this.validate();
      }
    });
  }

  parse(data) {
    try {
      this.data = JSON.parse(data);
      this.validate();
    } catch (e) {
      this.error(e);
    }
  }

  writeToDisk() {
    return new Promise((resolve, reject) => {
      fs.writeFile("./config.json", this.configToJson(), (e) => {
        if (e) {
          reject(e);
        } else {
          resolve();
        }
      });
    });
  }

  markForSave() {
    if (!this.marked) {
      this.marked = true;

      let intervalId = setInterval(() => {
        this.writeToDisk().then(() => {
          this.buddy.log.info("Config saved!");
          this.marked = false;
          this.attempt = 1;
          clearInterval(intervalId);
        }).catch((e) => {
          this.buddy.log.error(e);
          this.buddy.log.error(`Config save failed! (Attempt #${this.attempt})`);
          this.attempt++;
          if (this.attempt >= 5) {
            clearInterval(intervalId);
          }
        });
      }, 1000);
    }
  }

  validate() {
    if (typeof this.data !== "object") {
      this.error(new Error("Invalid data object in Config"));
    }

    if (typeof this.data.commands !== "object") {
      this.error(new Error("Invalid data child-object in Config (data.commands)"));
    }

    this.resolve();
  }

  configToJson() {
    return JSON.stringify(this.data, null, 4);
  }

  getSection(key) {
    return new ConfigSection(this, this.data).getSection(key);
  }

  getOrCreateSection(key) {
    return new ConfigSection(this, this.data).getOrCreateSection(key);
  }

  getDeepSection( /*multiple keys*/ ) {
    return new ConfigSection(this, this.data).getDeepSection(...arguments);
  }

  getOrCreateDeepSection( /*multiple keys*/ ) {
    return new ConfigSection(this, this.data).getOrCreateDeepSection(...arguments);
  }

};