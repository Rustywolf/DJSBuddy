const Module = require('../module/Module');
const Extension = require('./Extension');

function transform(extension) {
  if (typeof extension === "string") {
    return extension;
  }

  if (extension.name) {
    return extension.name;
  }

  throw new Error("Invalid extension passed to Extensions#transform");
}

module.exports = class Extensions extends Module {

  constructor(buddy) {
    super(buddy);

    this.extensions = {};
  }

  run() {
    this.ready();
  }

  get(extension) {
    let name = transform(extension);

    if (!this.has(name)) {
      throw new Error("Attempting to get unregistered extension: " + name);
    }

    return this.extensions[name];
  }

  has(extension) {
    let name = transform(extension);
    return this.extensions[name] instanceof Extension;
  }

  register(extension, enable = true) {
    if (!(extension instanceof Extension)) {
      throw new Error("Attempting to register non-extension");
    }

    let name = transform(extension);
    if (this.has(name)) {
      throw new Error("Registering extension with duplicate name: " + name);
    }

    this.extensions[name] = extension;

    if (enable) {
      extension.enable();
    }
  }

  unregister(extension) {
    let name = transform(extension);
    if (!this.has(name)) {
      throw new Error("Attempting to unregister unknown extension: " + name);
    }

    extension = this.get(name);
    extension.disable();
    delete this.extensions[name];
  }

}