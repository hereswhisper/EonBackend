import chalk, { Chalk } from "chalk";

export default {
  /**
   * Logs a message with specified formatting.
   * @param message - The message to log.
   * @param module - The name of the module or source of the log message.
   * @param color - The color to use for the log message (e.g., "greenBright").
   * @param args - Optional additional arguments to include in the log.
   */
  log(message: string, module: string, color: keyof Chalk, args?: unknown[]) {
    return logMessage(message, module, color, args);
  },

  /**
   * Logs an error message with red formatting.
   * @param message - The error message to log.
   * @param module - The name of the module or source of the error message.
   * @param args - Optional additional arguments to include in the error log.
   */
  error(message: string, module: string, args?: unknown[]) {
    return logMessage(message, module, "redBright", args);
  },

  /**
   * Logs a warning message with yellow formatting.
   * @param message - The warning message to log.
   * @param module - The name of the module or source of the warning message.
   * @param args - Optional additional arguments to include in the warning log.
   */
  warn(message: string, module: string, args?: unknown[]) {
    return logMessage(message, module, "yellowBright", args);
  },
};

function logMessage(
  message: string,
  module: string,
  color: keyof Chalk,
  args?: unknown[]
) {
  const timestamp = new Date().toISOString();
  const chalkColor: any = chalk[color];
  let logText = `${chalkColor.gray(timestamp)} [${chalkColor(
    module
  )}] ${message}`;

  if (args && args.length > 0) {
    logText += ` ${args.join(" ")}`;
  }

  console.log(logText);
}
