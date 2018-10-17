module.exports = class Extension {

  constructor(buddy, name) {
    this.buddy = buddy;
    this.name = name;
    this.commands = {};
    this.handlers = [];
    this.enabled = false;

    this.config = this.buddy.config.getOrCreateDeepSection("ext", name);
  }

  enable() {
    try {
      this.onEnable();
      this.registerCommands();
      this.registerHandlers();
      this.enabled = true;
    } catch (e) {
      this.buddy.log.error(e);
      this.buddy.log.error(`Unable to enable Extension '${this.name}'`);
    }
  }

  onEnable() {
    throw new Error(`onEnable must be implemented by Extension '${this.name}'`);
  }

  disable() {
    try {
      this.onDisable();
      this.unregisterCommands();
      this.unregisterHandlers();
      this.enabled = false;
    } catch (e) {
      this.buddy.log.error(e);
      this.buddy.log.error(`Unable to disable Extension '${this.name}'`);
    }
  }

  onDisable() {
    throw new Error(`onDisable must be implemented by Extension '${this.name}'`);
  }

  registerCommands() {
    for (let command in this.commands) {
      this.buddy.commands.addCommand(command, this.commands[command].handler, this.commands[command].options);
    }
  }

  unregisterCommands() {
    for (let command in this.commands) {
      this.buddy.commands.removeCommand(command);
    }
  }

  registerHandlers() {
    for (let eventHandler of this.handlers) {
      this.buddy.client.on(eventHandler.event, eventHandler.handler);
    }
  }

  unregisterHandlers() {
    for (let eventHandler of this.handlers) {
      this.buddy.client.removeListener(eventHandler.event, eventHandler.handler);
    }
  }

  hasCommand(command) {
    return this.commands[command] !== undefined;
  }

  addCommand(command, handler, options) {
    if (this.hasCommand(command)) {
      throw new Error(`Attempting to register duplicate command in Extension '${this.name}' (command: ${command})`)
    }

    if (this.enabled) {
      this.buddy.commands.addCommand(command, this.commands[command].handler, this.commands[command].options);
    }

    options = options || {};
    this.commands[command] = {
      handler,
      options
    };
  }

  removeCommand(command) {
    if (!this.hasCommand(command)) {
      throw new Error(`Attempting to remove unregistered command in Extension '${this.name}' (command: ${command})`)
    }

    if (this.enabled) {
      this.buddy.commands.removeCommand(command);
    }

    delete this.commands[command];
  }

  on(event, handler) {
    this.handlers.push({
      event: event,
      handler: handler
    });

    if (this.enabled) {
      this.buddy.client.on(event, handler);
    }
  }

  error(...args) {
    this.buddy.log.error(`${this.name} sent the following exception:`);
    for (let e of args) {
      this.buddy.log.error(e);
    }
  }

  warn(...args) {
    for (let msg of args) {
      this.buddy.log.warn(`<${this.name}> ${msg}`);
    }
  }

  info(...args) {
    for (let msg of args) {
      this.buddy.log.info(`<${this.name}> ${msg}`);
    }
  }

  verbose(...args) {
    for (let msg of args) {
      this.buddy.log.verbose(`<${this.name}> ${msg}`);
    }
  }

  debug(...args) {
    for (let msg of args) {
      this.buddy.log.debug(`<${this.name}> ${msg}`);
    }
  }

}