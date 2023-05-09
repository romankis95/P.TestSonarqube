'use strict';

const {
  createLogger,
  format,
  transports
} = require('winston');
require('winston-daily-rotate-file');

const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const logDir = 'public/logs/movimenti';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, 'results.txt');

const logger = createLogger({
  // change level if in dev environment versus production
  level: env === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.label({
      label: path.basename(process.mainModule.filename)
    }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    })
  ),

  transports: [
    new transports.Console({
      timestamp: true,
      format: format.combine(
        format.colorize(),
        format.printf(
          info =>
          `${info.timestamp}, ${info.level},   [${info.label}], ${info.message}`
        )
      )
    }),
    new transports.DailyRotateFile({
      filename: 'public/logs/movimenti/application-%DATE%.txt',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '365d',
      format: format.combine(
        format.printf(
          info =>
          `${info.timestamp}, ${info.level}, [${info.label}], ${info.message}`
        )
      )
    }),
    // new transports.File({
    //   filename,
    //   format: format.combine(
    //     format.printf(
    //       info =>
    //       `${info.timestamp}, ${info.level}, [${info.label}], ${info.message}`
    //     )
    //   )
    // })
  ]
});


module.exports = logger;