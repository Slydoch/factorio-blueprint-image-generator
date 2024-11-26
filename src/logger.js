const LogColors = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",
  FgGray: "\x1b[90m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
  BgGray: "\x1b[100m",
};

class Logger {
  constructor(path) {
    this.startTimestamp = new Date().toISOString();
    this.lastTimestamp = new Date().toISOString();
    this.path = path || "core";
  }

  log(message, value) {
    const timeDiffFromStart = new Date() - new Date(this.startTimestamp);
    const timeDiffFromLast = new Date() - new Date(this.lastTimestamp);
    const timeDiffStr = `${Math.floor(timeDiffFromLast / 1000 / 60)}m ${Math.floor(timeDiffFromLast / 1000) % 60}s ${timeDiffFromLast % 1000}ms`;
    const timeDiffStartStr = `${Math.floor(timeDiffFromStart / 1000 / 60)}m ${Math.floor(timeDiffFromStart / 1000) % 60}s ${timeDiffFromStart % 1000}ms`;
    console.log(`${LogColors.FgGray}|------------->\t${timeDiffStr}${LogColors.Reset}`);
    console.log(`${timeDiffStartStr}\t${LogColors.FgGray}${this.path} - ${message}${LogColors.Reset}`, value || "");
    this.lastTimestamp = new Date().toISOString();
  }

  error(message, value) {
    const timeDiffFromStart = new Date() - new Date(this.startTimestamp);
    const timeDiffFromLast = new Date() - new Date(this.lastTimestamp);
    const timeDiffStr = `${Math.floor(timeDiffFromLast / 1000 / 60)}m ${Math.floor(timeDiffFromLast / 1000) % 60}s ${timeDiffFromLast % 1000}ms`;
    const timeDiffStartStr = `${Math.floor(timeDiffFromStart / 1000 / 60)}m ${Math.floor(timeDiffFromStart / 1000) % 60}s ${timeDiffFromStart % 1000}ms`;
    console.error(`${LogColors.FgGray}|------------->\t${timeDiffStr}${LogColors.Reset}`);
    console.error(`${timeDiffStartStr}\t${LogColors.BgRed}${this.path} - ${message}${LogColors.Reset}`, value || "");
    this.lastTimestamp = new Date().toISOString();
  }
}

export default Logger;