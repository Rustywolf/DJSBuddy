module.exports = class ConfigSection {

  constructor(config, data) {
    this.config = config;
    this.data = data;

    this.validDataTypes = [
      "string",
      "number",
      "object",
      "boolean"
    ]
  }

  save() {
    this.config.markForSave();
  }

  has(key) {
    return this.data[key] !== undefined;
  }

  hasSection(key) {
    return (typeof this.data[key] === "object");
  }

  hasArray(key) {
    return Array.isArray(this.data[key]);
  }

  set(key, value) {
    if (!this.validDataTypes.includes(typeof value)) {
      throw new Error("Attempting to save invalid datatype: " + typeof value);
    }

    this.data[key] = value;
    this.config.markForSave();
  }

  get(key) {
    if (this.has(key)) {
      return this.data[key];
    } else {
      throw new Error("Undefined key in ConfigSection: " + key);
    }
  }

  remove(key) {
    let value = this.get(key);
    delete this.data[key];
    return value;
  }

  getOrDefault(key, def) {
    if (this.has(key)) {
      return this.data[key];
    } else {
      return def;
    }
  }

  getOrSet(key, value) {
    if (this.has(key)) {
      return this.data[key];
    } else {
      this.set(key, value);
      return value;
    }
  }

  getSection(key) {
    if (typeof this.data[key] === "object") {
      return new ConfigSection(this.config, this.data[key]);
    } else {
      throw new Error("Cannot create ConfigSection from non-object");
    }
  }

  getOrCreateSection(key) {
    if (this.data[key] === undefined) {
      this.set(key, {});
    }

    if (typeof this.data[key] === "object") {
      return new ConfigSection(this.config, this.data[key]);
    } else {
      throw new Error("Cannot create ConfigSection from non-object");
    }
  }

  getDeepSection( /*multiple keys*/ ) {
    let section = this;
    for (let key of arguments) {
      section = section.getSection(key);
    }

    return section;
  }

  getOrCreateDeepSection( /*multiple keys*/ ) {
    let section = this;
    for (let key of arguments) {
      section = section.getOrCreateSection(key);
    }

    return section;
  }

}