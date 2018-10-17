const Discord = require('discord.js');
const Module = require('../module/Module');
const Invocation = require('./Invocation');

const DEFAULT_SYMBOL = "!";

module.exports = class Commands extends Module {

  constructor(buddy) {
    super(buddy);
    this.config = buddy.config;
    this.DEFAULT_SYMBOL = DEFAULT_SYMBOL;

    this.commands = {};
  }

  run() {
    this.buddy.client.on('message', (msg) => {
      this.handleMessage(msg);
    });

    this.ready();
  }

  handleMessage(msg) {
    let commandSymbol = DEFAULT_SYMBOL;
    if (msg.channel instanceof Discord.TextChannel) {
      commandSymbol = this.getSymbol(msg.guild);
    }

    if (msg.content.length < commandSymbol.length + 1 || msg.content.slice(0, commandSymbol.length) !== commandSymbol) {
      return;
    }

    let invocation = new Invocation(msg, commandSymbol);

    if (this.commands[invocation.command]) {
      let registered = this.commands[invocation.command];
      if (invocation.isGuildMessage()) {
        let disabledSection = this.config.getOrCreateDeepSection("commands", "disabled");
        let channels = disabledSection.getOrCreateSection("channels");
        let guilds = disabledSection.getOrCreateSection("guilds");

        if (guilds.hasArray(invocation.getGuild().id)) {
          let guildEntry = guilds.get(invocation.getGuild().id);
          if (guildEntry.includes[invocation.command] || guildEntry.includes["*"]) {
            return;
          }
        }

        if (channels.hasArray(invocation.getChannel().id)) {
          let channelEntry = channels.get(invocation.getChannel().id);
          if (channelEntry.includes[invocation.command] || channelEntry.includes["*"]) {
            return;
          }
        }
      }

      if (Array.isArray(registered.options.types)) {
        if (!registered.options.types.includes(msg.channel.type)) {
          return;
        }
      } else if (registered.options.type) {
        if (registered.options.type.toLowerCase() !== msg.channel.type) {
          return;
        }
      }

      if (typeof registered.options.test === "function") {
        try {
          if (!registered.options.test(invocation)) {
            return;
          }
        } catch (e) {
          this.buddy.log.error(e);
          this.buddy.log.error(`Exception detected while executing test for command '${invocation.command}'`);
        }
      }

      try {
        registered.handler(invocation);
      } catch (e) {
        this.buddy.log.error(e);
        this.buddy.log.error(`Exception detected while invoking command '${invocation.command}'`);
      }
    }
  }

  getSymbol(guild) {
    let serverSymbols = this.config.getOrCreateDeepSection("commands", "symbols");
    if (serverSymbols.has(guild.id)) {
      return serverSymbols.get(guild.id);
    } else {
      return DEFAULT_SYMBOL
    }
  }

  /*
  options:
  test: () => {true/false}  -- predicate to test whether the command should execute,
  types: []                 -- types of channels that are supported for this command,
  */
  addCommand(command, handler, options) {
    if (command == "*") {
      throw new Error("Unable to register wildstar as a command");
    }

    options = options || {};
    this.commands[command] = {
      handler,
      options
    };
  }

  hasCommand(command) {
    return this.commands[command] !== undefined;
  }

  removeCommand(command) {
    delete this.commands[command];
  }

}