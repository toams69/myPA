"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const optimist_1 = require("optimist");
const path = require("path");
const nconf = require("nconf");
const nconfYaml = require("nconf-yaml");
const log_utils_1 = require("utils/log-utils");
const logger = require("logger");
const log = logger.child({ from: 'Config' });
class Config {
    resolvePathToConfig() {
        let pathToConf;
        if (optimist_1.argv.conf) {
            pathToConf = path.resolve(optimist_1.argv.conf);
        }
        else {
            pathToConf = path.resolve(__dirname, '../config/default.yaml');
        }
        return pathToConf;
    }
    initialize() {
        let pathToConf = this.resolvePathToConfig();
        log.debug(`Reading config from: ${pathToConf}`);
        nconf.env().argv();
        nconf.add('global', { type: 'file', file: pathToConf, format: nconfYaml });
        nconf.add('default', { type: 'file', file: '/config/default.yaml', format: nconfYaml });
        return this;
    }
    getValue(name) {
        return nconf.get(name);
    }
    _getSection(sectionName) {
        const section = this.getValue(sectionName);
        if (!section) {
            return new Proxy({}, {
                get: (target, name) => {
                    return undefined;
                }
            });
        }
        return section;
    }
    getFromEnvOrConfig(envKey, sectionKey) {
        const envVal = this.getValue(envKey);
        if (envVal) {
            return envVal;
        }
        else {
            let [sectionName, subsectionName] = sectionKey;
            const section = this._getSection(sectionName);
            return section[subsectionName];
        }
    }
    get corsAllowedOrigins() {
        // TODO (shabunc): do we need both enableCors and corsAllowedOrigins? Also, may be we should return array here
        return this.getFromEnvOrConfig('ALFRED_CORS_ALLOWED_ORIGINS', ['cors', 'allowedOrigins']);
    }
    get adminUsername() {
        return this.getFromEnvOrConfig('ALFRED_ADMIN_USERNAME', ['admin', 'username']);
    }
    get adminPassword() {
        return this.getFromEnvOrConfig('ALFRED_ADMIN_PASSWORD', ['admin', 'password']);
    }
    get clientId() {
        return this.getFromEnvOrConfig('ALFRED_COMMON_CLIENT_ID', ['common', 'clientId']);
    }
    get clientSecret() {
        return this.getFromEnvOrConfig('ALFRED_COMMON_CLIENT_SECRET', ['common', 'clientSecret']);
    }
    get authUri() {
        return this.getFromEnvOrConfig('ALFRED_SERVICES_AUTH', ['services', 'auth']);
    }
    get cleanupDelay() {
        return parseInt(this.getFromEnvOrConfig('ALFRED_SESSION_CLEANUP_DELAY', ['session', 'cleanupDelay']));
    }
    get cleanupInterval() {
        return parseInt(this.getFromEnvOrConfig('ALFRED_SESSION_CLEANUP_INTERVAL', ['session', 'cleanupInterval']));
    }
    get connectionRecordTTL() {
        return parseInt(this.getFromEnvOrConfig('ALFRED_SESSION_CONNECTION_RECORD_TTL', ['session', 'connectionRecordTTL']));
    }
    get connectionRecordRefreshInterval() {
        return parseInt(this.getFromEnvOrConfig('ALFRED_SESSION_CONNECTION_RECORD_RERFRESH_INTERVAL', ['session', 'connectionRecordRefreshInterval']));
    }
    get enableCleanup() {
        let rawVal = this.getFromEnvOrConfig('ALFRED_SESSION_ENABLE_CLEANUP', ['session', 'enableCleanup']);
        return String(rawVal) === 'true';
    }
    get enableCors() {
        let rawVal = this.getFromEnvOrConfig('ALFRED_CORS_ENABLE', ['cors', 'enable']);
        return String(rawVal) === 'true';
    }
    get serverPort() {
        let val = parseInt(this.getFromEnvOrConfig('ALFRED_SERVER_PORT', ['server', 'port']));
        return val || 8017;
    }
    // how many ms without a pong packet to consider the connection closed (60000)
    get socketIoPingTimeout() {
        let val = parseInt(this.getFromEnvOrConfig('ALFRED_SOCKETIO_PING_TIMEOUT', ['socket-io', 'pingTimeout']));
        return val || 60000;
    }
    // how many ms before sending a new ping packet (25000)
    get socketIoPingInterval() {
        let val = parseInt(this.getFromEnvOrConfig('ALFRED_SOCKETIO_PING_INTERVAL', ['socket-io', 'pingInterval']));
        return val || 25000;
    }
    // transports to allow connections to (['polling', 'websocket'])
    get socketIoTransports() {
        let val = undefined;
        try {
            val = this.getFromEnvOrConfig('ALFRED_SOCKETIO_TRANSPORTS', ['socket-io', 'transports']);
        }
        catch (err) {
            val = undefined;
        }
        return val || ['polling', 'websocket'];
    }
    // name of the HTTP cookie that contains the client sid to send as part of handshake response headers.
    // Set to false to not send one. (io)
    get socketIoCookie() {
        let val = this.getFromEnvOrConfig('ALFRED_SOCKETIO_COOKIE', ['socket-io', 'cookie']);
        return val || 'io';
    }
    printConfig() {
        let width = 60;
        let msg = '';
        msg += 'Server Configuration:\n';
        msg += '[=-----------------------------------------------------------------------=]\n';
        msg += ` ${log_utils_1.padRight('ALFRED_ADMIN_USERNAME', width)}` +
            `=> ${this.adminUsername}\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_ADMIN_PASSWORD', width)}` +
            `=> ${this.adminPassword}\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_CORS_ENABLE', width)}` +
            `=> ${this.enableCors}\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_CORS_ALLOWED_ORIGINS', width)}` +
            `=> ${this.corsAllowedOrigins}\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_COMMON_CLIENT_ID', width)}` +
            `=> ${this.clientId}\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_COMMON_CLIENT_SECRET', width)}` +
            `=> *****\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_SERVICES_AUTH', width)}` +
            `=> ${this.authUri}\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_SERVER_PORT', width)}` +
            `=> ${this.serverPort}\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_SESSION_ENABLE_CLEANUP', width)}` +
            `=> ${this.enableCleanup}\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_SESSION_CLEANUP_DELAY', width)}` +
            `=> ${this.cleanupDelay || '-'}\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_SESSION_CLEANUP_INTERVAL', width)}` +
            `=> ${this.cleanupInterval || '-'}\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_SESSION_CONNECTION_RECORD_TTL', width)}` +
            `=> ${this.connectionRecordTTL || '-'}\n`;
        msg += ` ${log_utils_1.padRight('ALFRED_SESSION_CONNECTION_RECORD_RERFRESH_INTERVAL', width)}` +
            `=> ${this.connectionRecordRefreshInterval || '-'}\n`;
        msg += '[=-----------------------------------------------------------------------=]';
        log.debug(msg);
    }
}
exports.Config = Config;
//# sourceMappingURL=Config.js.map