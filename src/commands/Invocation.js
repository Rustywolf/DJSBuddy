const Discord = require("discord.js");

module.exports = class Invocation {

  constructor(message, symbol) {
    this.message = message;

    this.symbol = symbol;
    this.args = this.message.content.slice(symbol.length).split(" ");
    this.command = this.args.shift();
  }

  checkBounds(idx) {
    if (!this.hasArg(idx)) {
      throw new Error("Attempting to access index higher than bounds of arguments: " + idx);
    }

    return true;
  }

  hasArg(idx) {
    return idx < this.args.length;
  }

  getArgString() {
    return this.args.join(" ");
  }

  getArg(idx) {
    if (this.checkBounds(idx)) {
      return this.args[idx];
    }
  }

  getArgAsNumber(idx) {
    if (this.checkBounds(idx)) {
      if (this.argIsNumber(idx)) {
        return Number(this.args[idx]);
      } else {
        throw new Error(`Attempting to cast non-number argument (idx: ${idx}, value: ${this.args[idx]})`);
      }
    }
  }

  getArgAsBoolean(idx) {
    if (this.checkBounds(idx)) {
      if (this.argIsBoolean(idx)) {
        return this.args[idx] == "true";
      } else {
        throw new Error(`Attempting to cast non-boolean argument (idx: ${idx}, value: ${this.args[idx]})`);
      }
    }
  }

  argIsNumber(idx) {
    if (this.checkBounds(idx)) {
      return Number.isNaN(Number(this.args[idx]));
    }
  }

  argIsBoolean(idx) {
    if (this.checkBounds(idx)) {
      return this.args[idx] == "true" || this.args[idx] == "false";
    }
  }

  isGuildMessage() {
    return this.message.channel instanceof Discord.TextChannel;
  }

  isDMMessage() {
    return this.isUserDMMessage() || this.isGroupDMMessage();
  }

  isUserDMMessage() {
    return this.message.channel instanceof Discord.DMChannel;
  }

  isGroupDMMessage() {
    return this.message.channel instanceof Discord.GroupDMChannel;
  }

  isGuildOwner() {
    if (!this.isGuildMessage()) {
      throw new Error("Attempting to access guild information on non-guild message");
    } else {
      return this.message.guild.owner.id === this.message.member.id;
    }
  }

  getMessage() {
    return this.message;
  }

  getAuthor() {
    return this.message.author;
  }

  getMember() {
    if (!this.isGuildMessage()) {
      throw new Error("Attempting to access GuildMember on non-guild message");
    }

    return this.memssage.member;
  }

  getGuild() {
    if (!this.isGuildMessage()) {
      throw new Error("Attempting to access Guild on non-guild message");
    }

    return this.message.guild;
  }

  getChannel() {
    return this.message.channel;
  }

}
