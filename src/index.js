const fs = require('fs');
const EventEmitter = require('events');
const Discord = require('discord.js');

const Commands = require('./commands/Commands');
const Config = require('./config/Config');
const Extensions = require('./extensions/Extensions');
const Log = require('./logging/Log');

const Extension = require('./extensions/Extension');
const SystemCommands = require('./extensions/default/SystemCommands');
const ExtensionCommands = require('./extensions/default/ExtensionCommands');
const HelpCommands = require('./extensions/default/HelpCommands');

const TimeUtil = require('./util/TimeUtil');

module.exports = {
  create: (options) => {
    return new Promise((resolve, reject) => {
      let buddy = new DJSBuddy(resolve, reject, options || {});
    });
  },

  Extension: Extension,
  TimeUtil: TimeUtil,
  Discord: Discord
};

class DJSBuddy extends EventEmitter {

  constructor(resolve, reject, options) {
    super();
    this.resolve = resolve;
    this.reject = reject;
    this.options = Object.assign({
      handleUncaughtExceptions: true,
      registerDefaultExtensions: true,
      adminId: null
    }, options);

    this.client = new Discord.Client();
    this.client.on('error', () => process.exit(500));
    this.startTime = Date.now();

    /* Modules */
    this.config = null;
    this.commands = null;
    this.extensions = null;
    this.log = null;
    this.loadModules().then(() => {
      if (this.options.registerDefaultExtensions) {
        if (!this.options.adminId) {
          throw new Error("Unable to register default extensions -- please provide an Admin ID");
        }

        this.registerDefaultExtensions(this.options.adminId);
      }

      if (this.options.handleUncaughtExceptions) {
        process.on('uncaughtException', (e) => {
          this.log.error(e);
          this.log.error("Warning: Uncaught Exception detected");
        });
      }

      this.resolve(this);
    }).catch((e) => {
      this.reject(e);
    });
  }

  loadModules() {
    return new Promise((resolve, reject) => {

      // Hardcode loading of config first so that other Modules can use the config module
      this.config = new Config(this);
      this.config.start().then(() => {
        this.commands = new Commands(this);
        this.extensions = new Extensions(this);
        this.log = new Log(this);

        let modules = [this.commands, this.extensions, this.log];

        let loading = modules.slice(0);

        for (let module of modules) {

          module.start().then(() => {
            loading.splice(loading.indexOf(module), 1);
            if (loading.length == 0) {
              resolve();
            }
          }).catch((e) => {
            reject(e);
          });
        }
      }).catch((e) => {
        reject(e);
      });
    });
  }

  registerDefaultExtensions(ADMIN_ID) {
    this.extensions.register(new SystemCommands(this, ADMIN_ID));
    this.extensions.register(new ExtensionCommands(this, ADMIN_ID));
    this.extensions.register(new HelpCommands(this));
  }

  login(token) {
    this.client.login(token);
  }
}