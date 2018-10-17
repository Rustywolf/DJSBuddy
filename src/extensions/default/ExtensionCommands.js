const Extension = require('../Extension');

module.exports = class ExtensionCommands extends Extension {

  constructor(buddy, ADMIN_ID) {
    super(buddy, "ExtensionCommands");
    this.ADMIN_ID = ADMIN_ID;
    this.ADMIN_TEST = (cmd) => cmd.getAuthor().id === this.ADMIN_ID;

    this.addCommand("extension", (cmd) => this.extensionCmd(cmd), {
      test: this.ADMIN_TEST
    });
  }

  onEnable() {}
  onDisable() {}

  extensionCmd(cmd) {
    if (!cmd.hasArg(1)) {
      cmd.getChannel().send(`Usage: ${this.buddy.commands.getSymbol(cmd.getGuild())}extension <enable|disable|reload> <extension>`);
      return;
    }

    let subcmd = cmd.getArg(0);
    let extension = cmd.getArg(1);

    if (!this.buddy.extensions.has(extension)) {
      cmd.getChannel().send(`Error: unknown extension '${extension}'`);
      return;
    }

    extension = this.buddy.extensions.get(extension);
    if (subcmd === "enable") {
      if (extension.enabled) {
        cmd.getChannel().send(`Error: Extension '${extension} is already enabled'`);
        return;
      } else {
        extension.enable();
      }
    } else if (subcmd === "disable") {
      if (!extension.enabled) {
        cmd.getChannel().send(`Error: Extension '${extension} is already disabled'`);
        return;
      } else {
        extension.disable();
      }
    } else {
      cmd.getChannel().send(`Error: unknown request '${subcmd}'`);
      return;
    }
  }

}