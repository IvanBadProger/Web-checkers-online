import { join } from "path"
import pino from "pino"

export class Logger {
  private logger: pino.Logger
  private static instance: Logger

  constructor() {
    const logDir = "logs"

    const transports = pino.transport({
      targets: [
        {
          target: "pino/file",
          level: process.env.LOG_LEVEL || "info",
          options: {
            destination: join(logDir, "app.log"),
            mkdir: true,
            append: true,
          },
        },

        {
          target: "pino/file",
          level: "error",
          options: {
            destination: join(logDir, "error.log"),
            mkdir: true,
            append: true,
          },
        },

        {
          target: "pino-pretty",
          level: process.env.LOG_LEVEL || "info",
          options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      ],
    })

    this.logger = pino(
      {
        level: process.env.LOG_LEVEL || "info",
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label) => ({ level: label.toUpperCase() }),
          bindings: () => ({
            pid: process.pid,
            env: process.env.NODE_ENV || "development",
          }),
        },
      },
      transports
    )

    transports.on("error", (error: unknown) => {
      console.error("Logger transport error:", error)
    })
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public info(message: string, data?: Record<string, any>): void {
    this.logger.info(data, message)
  }

  public error(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      this.logger.error(
        {
          error: error.message,
          stack: error.stack,
        },
        message
      )
    } else {
      this.logger.error(error, message)
    }
  }

  public warn(message: string, data?: Record<string, any>): void {
    this.logger.warn(data, message)
  }

  public debug(message: string, data?: Record<string, any>): void {
    this.logger.debug(data, message)
  }

  public trace(message: string, data?: Record<string, any>): void {
    this.logger.trace(data, message)
  }

  public fatal(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      this.logger.fatal(
        {
          error: error.message,
          stack: error.stack,
        },
        message
      )
    } else {
      this.logger.fatal(error, message)
    }
  }

  public socket(event: string, socketId: string, data?: Record<string, any>): void {
    this.info(`Socket ${event}`, {
      type: "socket",
      socketId,
      ...data,
    })
  }

  public game(event: string, roomId: string, data?: Record<string, any>): void {
    this.info(`Game ${event}`, {
      type: "game",
      roomId,
      ...data,
    })
  }

  public http(method: string, url: string, status: number, data?: Record<string, any>): void {
    this.info(`HTTP ${method} ${url} - ${status}`, {
      type: "http",
      method,
      url,
      status,
      ...data,
    })
  }

  public getPinoInstance(): pino.Logger {
    return this.logger
  }
}
