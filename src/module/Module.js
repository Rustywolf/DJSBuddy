module.exports = class Module {

  constructor(buddy) {
    this.buddy = buddy;
    this.initialized = false;
    this.promise = null;
    this.resolve = null;
    this.reject = null;
  }

  start() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      try {
        this.run();
      } catch (e) {
        this.exception(e);
      }
    });

    return this.promise;
  }

  run() {
    throw new Error("Run was not implemented within module!");
  }

  exception(e) {
    if (this.reject) {
      let reject = this.reject;
      this.reject = null;
      this.resolve = null;
      reject(e);
    } else {
      throw new Error("Trying to error after reject");
    }
  }

  ready() {
    if (this.resolve) {
      let resolve = this.resolve;
      this.resolve = null;
      this.reject = null;
      resolve();
      this.initialized = true;
    } else {
      throw new Error("Attempting to resolve after ready");
    }
  }

}