import {argv}       from 'optimist';
import * as bunyan  from 'bunyan';

const log = bunyan.createLogger({
  name: 'alfred-api',
  streams: [
    {
      // daemon-launcher will take care of moving this to log file
      level: argv['log-level'] || 'trace',
      stream: process.stdout
    }
  ]
});

export = log;
