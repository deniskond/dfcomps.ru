import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as os from 'os';
require('winston-syslog').Syslog;

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      format: winston.format.simple(),
      levels: winston.config.syslog.levels,
      transports: [
        new (winston.transports as any).Syslog({
          host: 'logs3.papertrailapp.com',
          port: 39258,
          protocol: 'tls4',
          localhost: os.hostname(),
          eol: '\n',
        }),
      ],
    });
  }

  public log(message: string) {
    this.logger.info(message);
  }
}
