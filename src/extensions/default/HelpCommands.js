const Discord = require('discord.js');
const Extension = require('../Extension');

module.exports = class HelpCommands extends Extension {

  constructor(buddy) {
    super(buddy, "HelpCommands");
    this.addCommand("help", (cmd) => this.helpCmd(cmd));
    this.addCommand("about", (cmd) => this.aboutCmd(cmd));

    this.color = 0x40558B;
    this.aboutText = `DJSBuddy - Created by Rustywolf (/u/Rustywolf, Rusty#4765)
Github - https://github.com/RustyDawson/DJSBuddy`;

    this.categories = [];
    this.defaultDescription = `__General__
**!disable <command> <channel|guild>** - Disables <command> for current channel or guild
**!help** - Lists all commands
**!about** - More information about this bot`;
  }

  onEnable() {}
  onDisable() {}

  addHelpCategory(...args/* header, lines[] */) {
    if (args.length < 2) {
      throw new Error(`Illegal invocation of addHelpCategory: too few arguments ${args.length}`);
    }

    this.categories.push({
      header: args.slice(0, 1),
      lines: args.slice(1)
    });
  }

  setAboutText(text) {
    this.aboutText = text;
  }

  helpCmd(cmd) {
    let description = "";
    for (let category of this.categories) {
      description += `__${category.header}__\n`;
      for (let line of category.lines) {
        description += line + "\n";
      }

      description += "\n";
    }

    description += this.defaultDescription;

    var embed = new Discord.MessageEmbed();
    embed.setAuthor("Help");
    embed.setColor(0x40558B);
    embed.setDescription(description);

    cmd.getChannel().send(embed);
  }

  aboutCmd(cmd) {
    var embed = new Discord.RichEmbed();
    embed.setAuthor("About");
    embed.setColor(this.color);
    embed.setDescription(this.aboutText);

    cmd.getChannel().send(embed);
  }

}
