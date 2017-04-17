"use strict";
const optimist_1 = require("optimist");
const bunyan = require("bunyan");
const log = bunyan.createLogger({
    name: 'alfred-api',
    streams: [
        {
            // daemon-launcher will take care of moving this to log file
            level: optimist_1.argv['log-level'] || 'trace',
            stream: process.stdout
        }
    ]
});
module.exports = log;
//# sourceMappingURL=logger.js.map