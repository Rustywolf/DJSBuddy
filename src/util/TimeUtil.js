module.exports = {
  getTimeString: (delta) => {
    let ret = "";
    let remaining = delta = Math.floor(delta / 1000);

    if (delta > 7 * 24 * 60 * 60) {
      ret += Math.floor(remaining / 7 * 24 * 60 * 60) + "w ";
      remaining %= 7 * 24 * 60 * 60;
    }

    if (delta > 24 * 60 * 60) {
      ret += Math.floor(remaining / 24 * 60 * 60) + "d ";
      remaining %= 24 * 60 * 60;
    }

    if (delta > 60 * 60) {
      ret += Math.floor(remaining / 60 * 60) + "h ";
      remaining %= 60 * 60;
    }

    if (delta > 60) {
      ret += Math.floor(remaining / 60) + "m ";
      remaining %= 60;
    }

    ret += remaining + "s";

    return ret;
  }
}