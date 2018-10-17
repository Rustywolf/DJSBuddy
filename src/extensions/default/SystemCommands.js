const Extension = require('../Extension');
const getTimeString = require('../../util/TimeUtil').getTimeString;

module.exports = class SystemCommands extends Extension {

  constructor(buddy, ADMIN_ID) {
    super(buddy, "SystemCommands");
    this.ADMIN_ID = ADMIN_ID;
    this.ADMIN_TEST = (cmd) => cmd.getAuthor().id === this.ADMIN_ID;
    this.OWNER_TEST = (cmd) => {
      if (cmd.isGuildMessage()) {
        return cmd.getMember().id === cmd.getGuild().owner.id || cmd.getAuthor().id === this.ADMIN_ID;
      } else {
        return false;
      }
    }

    /* ADMIN COMMANDS */

    this.addCommand("count", (cmd) => this.count(cmd), {
      test: this.ADMIN_TEST
    });

    this.addCommand("exit", (cmd) => this.exit(cmd), {
      test: this.ADMIN_TEST
    });

    this.addCommand("pmowners", (cmd) => this.pmOwners(cmd), {
      test: this.ADMIN_TEST
    });

    this.addCommand("remove", (cmd) => this.removeCmd(cmd), {
      test: this.ADMIN_TEST
    });

    this.addCommand("uptime", (cmd) => this.upTime(cmd), {
      test: this.ADMIN_TEST
    });

    this.addCommand("usercount", (cmd) => this.userCount(cmd), {
      test: this.ADMIN_TEST
    });

    /* OWNER COMMANDS */

    this.addCommand("disable", (cmd) => this.disableCmd(cmd), {
      test: this.OWNER_TEST
    });

    this.addCommand("enable", (cmd) => this.enableCmd(cmd), {
      test: this.OWNER_TEST
    });

    this.addCommand("symbol", (cmd) => this.symbol(cmd), {
      test: this.OWNER_TEST
    });
  }

  onEnable() {}
  onDisable() {}

  count(cmd) {
    cmd.getChannel().send("Server Count: **" + this.buddy.client.guilds.size + "**");
  }

  disableCmd(cmd) {
    let disabledSection = this.buddy.config.getOrCreateDeepSection("commands", "disabled");
    let channels = disabledSection.getOrCreateSection("channels");
    let guilds = disabledSection.getOrCreateSection("guilds");

    if (!cmd.hasArg(1)) {
      cmd.getChannel().send(`Usage: ${this.buddy.commands.getSymbol(cmd.getGuild())}disable <command> <channel|guild>`);
      return;
    }

    let command = cmd.getArg(0);
    let scope = cmd.getArg(1);

    if (!this.buddy.commands.hasCommand(command)) {
      cmd.getChannel().send(`Error: Attempting to disable unknown command '${command}'`);
      return;
    }

    if (scope === "channel") {
      let disabled = channels.getOrSet(cmd.getChannel().id, []);
      if (disabled.includes(command)) {
        cmd.getChannel().send(`Error: Command '${command}' is already disabled in current channel`);
        return;
      }

      disabled.push(command);
      channels.save();
    } else if (scope === "guild") {
      let disabled = guilds.getOrSet(cmd.getGuild().id, []);
      if (disabled.includes(command)) {
        cmd.getChannel().send(`Error: Command '${command}' is already disabled in current guild`);
        return;
      }

      disabled.push(command);
      guilds.save();
    } else {
      cmd.getChannel().send(`Error: Unknown scope'${scope}'`);
    }
  }

  enableCmd(cmd) {
    let disabledSection = this.buddy.config.getOrCreateDeepSection("commands", "disabled");
    let channels = disabledSection.getOrCreateSection("channels");
    let guilds = disabledSection.getOrCreateSection("guilds");

    if (!cmd.hasArg(1)) {
      cmd.getChannel().send(`Usage: ${this.buddy.commands.getSymbol(cmd.getGuild())}enable <command> <channel|guild>`);
      return;
    }

    let command = cmd.getArg(0);
    let scope = cmd.getArg(1);

    if (!this.buddy.commands.hasCommand(command)) {
      cmd.getChannel().send(`Error: Attempting to enable unknown command '${command}'`);
      return;
    }

    if (scope === "channel") {
      let disabled = channels.getOrSet(cmd.getChannel().id, []);
      if (!disabled.includes(command)) {
        cmd.getChannel().send(`Error: Command '${command}' is already enabled in current channel`);
        return;
      }

      disabled.splice(disabled.indexOf(command), 1);
      channels.save();
    } else if (scope === "guild") {
      let disabled = guilds.getOrSet(cmd.getGuild().id, []);
      if (!disabled.includes(command)) {
        cmd.getChannel().send(`Error: Command '${command}' is already enabled in current guild`);
        return;


        disabled.splice(disabled.indexOf(command), 1);
        guilds.save();
      } else {
        cmd.getChannel().send(`Error: Unknown scope'${scope}'`);
      }
    }
  }

  exit(cmd) {
    let code = (cmd.argIsNumber(0)) ? cmd.getArgAsNumber(0) : 0;
    process.exit(code);
  }

  pmOwners(cmd) {
    var message = cmd.getArgString();
    this.buddy.client.guilds.forEach((guild) => {
      if (guild.owner) {
        guild.owner.send(message);
      }
    });
  }

  removeCmd(cmd) {
    cmd.args.forEach((code) => {
      message.channel.fetchMessage(code).then((message) => {
        message.delete();
      }).catch((e) => {
        this.buddy.log.error(e);
        cmd.getAuthor().send("Error removing messages!");
      });
    });
  }

  symbol(cmd) {
    if (!cmd.hasArg(0)) {
      cmd.getChannel().send(`Usage: ${this.buddy.commands.getSymbol(cmd.getGuild())}symbol <symbol>`);
      return;
    }

    let symbol = cmd.getArg(0);
    let serverSymbols = this.buddy.config.getOrCreateDeepSection("commands", "symbols");
    serverSymbols.set(cmd.getGuild().id, symbol);

    cmd.getChannel().sendMessage(`Success! Symbol updated to '${symbol}'`);
  }

  upTime(cmd) {
    cmd.getChannel().send(`Current uptime: **${getTimeString(Date.now() - this.buddy.startTime)}**`);
  }

  userCount(cmd) {
    let guilds = [...this.buddy.client.guilds.values()];
    let count = guilds.length;
    let uniqueMembers = [];

    let check = () => {
      if (count == 0) {
        cmd.getChannel().send("User Count: **" + uniqueMembers.length + "**");
      }

      return count == 0;
    };

    let next = () => {
      let guild = guilds[count - 1];
      guild.members.fetch().then(members => {
        members.forEach((member) => {
          if (!uniqueMembers.includes(member.id)) uniqueMembers.push(member.id);
        });

        count--;
        if (!check()) {
          next();
        }
      }).catch(() => {
        count--;
        if (!check()) {
          next();
        }
      });
    }

    next();
  }
}