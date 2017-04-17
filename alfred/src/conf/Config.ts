import {argv}         from 'optimist';
import * as path      from 'path';
import * as nconf     from 'nconf';
import * as nconfYaml from 'nconf-yaml';

import {padRight}     from 'utils/log-utils';
import * as logger    from 'logger';

const log = logger.child({from: 'Config'});

type sectionName = 
    'admin' 
  | 'common' 
  | 'cors' 
  | 'logging' 
  | 'services' 
  | 'session' 
  | 'server'
  | 'socket-io';


export interface ConfigInterface {
  serverPort: number;
  enableCors: boolean;
  corsAllowedOrigins: string;
  printConfig: any;
  socketIoPingTimeout: number;
  socketIoPingInterval: number;
  socketIoTransports: Array<string>;
  socketIoCookie: string;
  _getSection(name: string): {cert: string, key: string};
}

class Config implements ConfigInterface {

  resolvePathToConfig(): string {
    let pathToConf: string;

    if (argv.conf) {
      pathToConf = path.resolve(argv.conf);
    } else {
      pathToConf = path.resolve(__dirname, '../config/default.yaml');
    }

    return pathToConf;
  }

  initialize(): this {
    let pathToConf = this.resolvePathToConfig();
    log.debug(`Reading config from: ${pathToConf}`);

    nconf.env().argv();
    nconf.add('global',  {type: 'file', file: pathToConf, format: nconfYaml});
    nconf.add('default', {type: 'file', file: '/config/default.yaml', format: nconfYaml});
    return this;
  }

  getValue(name: string): any {
    return nconf.get(name);
  }

  _getSection(sectionName: string): any {
    const section =  this.getValue(sectionName);
    if (!section) {
      return new Proxy({}, {
        get: (target: any, name: string): any => {
          return undefined;
        }
      });
    }
    return section;
  }

  getFromEnvOrConfig(envKey: string, sectionKey: [sectionName, string]): string {
    const envVal = this.getValue(envKey);
    if (envVal) {
      return envVal;
    } else {
      let [sectionName, subsectionName] = sectionKey;
      const section = this._getSection(sectionName);
      return section[subsectionName];
    }
  }

  get corsAllowedOrigins(): string {
    // TODO (shabunc): do we need both enableCors and corsAllowedOrigins? Also, may be we should return array here
    return this.getFromEnvOrConfig('ALFRED_CORS_ALLOWED_ORIGINS', ['cors', 'allowedOrigins']);
  }

  get adminUsername(): string {
    return this.getFromEnvOrConfig('ALFRED_ADMIN_USERNAME', ['admin', 'username']);
  }

  get adminPassword(): string {
    return this.getFromEnvOrConfig('ALFRED_ADMIN_PASSWORD', ['admin', 'password']);
  }

  get clientId(): string {
    return this.getFromEnvOrConfig('ALFRED_COMMON_CLIENT_ID', ['common', 'clientId']);
  }

  get clientSecret(): string {
    return this.getFromEnvOrConfig('ALFRED_COMMON_CLIENT_SECRET', ['common', 'clientSecret']);
  }

  get authUri(): string {
    return this.getFromEnvOrConfig('ALFRED_SERVICES_AUTH', ['services', 'auth']);
  }

  get cleanupDelay(): number {
    return parseInt(this.getFromEnvOrConfig('ALFRED_SESSION_CLEANUP_DELAY', ['session', 'cleanupDelay']));
  }

  get cleanupInterval(): number {
    return parseInt(this.getFromEnvOrConfig('ALFRED_SESSION_CLEANUP_INTERVAL', ['session', 'cleanupInterval']));
  }

  get connectionRecordTTL(): number {
    return parseInt(this.getFromEnvOrConfig('ALFRED_SESSION_CONNECTION_RECORD_TTL', ['session', 'connectionRecordTTL']));
  }

  get connectionRecordRefreshInterval(): number {
    return parseInt(this.getFromEnvOrConfig('ALFRED_SESSION_CONNECTION_RECORD_RERFRESH_INTERVAL', 
      ['session', 'connectionRecordRefreshInterval']));
  }

  get enableCleanup(): boolean {
    let rawVal = this.getFromEnvOrConfig('ALFRED_SESSION_ENABLE_CLEANUP', ['session', 'enableCleanup']);
    return String(rawVal) === 'true';
  }

  get enableCors(): boolean {
    let rawVal = this.getFromEnvOrConfig('ALFRED_CORS_ENABLE', ['cors', 'enable']);
    return String(rawVal) === 'true';
  }

  get serverPort(): number {
    let val = parseInt(this.getFromEnvOrConfig('ALFRED_SERVER_PORT', ['server', 'port']));
    return val || 8017;
  }

  // how many ms without a pong packet to consider the connection closed (60000)
  get socketIoPingTimeout(): number {
    let val = parseInt(this.getFromEnvOrConfig('ALFRED_SOCKETIO_PING_TIMEOUT', ['socket-io', 'pingTimeout']));
    return val || 60000;
  }

  // how many ms before sending a new ping packet (25000)
  get socketIoPingInterval(): number {
    let val = parseInt(this.getFromEnvOrConfig('ALFRED_SOCKETIO_PING_INTERVAL', ['socket-io', 'pingInterval']));
    return val || 25000;
  }

  // transports to allow connections to (['polling', 'websocket'])
  get socketIoTransports(): Array<string> {
    let val = undefined;
    try {
      val = this.getFromEnvOrConfig('ALFRED_SOCKETIO_TRANSPORTS', ['socket-io', 'transports']);
    } catch (err) {
      val = undefined;
    }
    return val || ['polling', 'websocket'];
  }

  // name of the HTTP cookie that contains the client sid to send as part of handshake response headers.
  // Set to false to not send one. (io)
  get socketIoCookie(): string {
    let val = this.getFromEnvOrConfig('ALFRED_SOCKETIO_COOKIE', ['socket-io', 'cookie']);
    return val || 'io';
  }

  public printConfig(): any {
    let width = 60;
    let msg = '';
    msg += 'Server Configuration:\n';
    msg += '[=-----------------------------------------------------------------------=]\n';
    msg += ` ${padRight('ALFRED_ADMIN_USERNAME', width)}` +
       `=> ${this.adminUsername}\n`;
    msg += ` ${padRight('ALFRED_ADMIN_PASSWORD', width)}` +
       `=> ${this.adminPassword}\n`;
    msg += ` ${padRight('ALFRED_CORS_ENABLE', width)}` + 
      `=> ${this.enableCors}\n`;
    msg += ` ${padRight('ALFRED_CORS_ALLOWED_ORIGINS', width)}` +
       `=> ${this.corsAllowedOrigins}\n`;
    msg += ` ${padRight('ALFRED_COMMON_CLIENT_ID', width)}` +
       `=> ${this.clientId}\n`;
    msg += ` ${padRight('ALFRED_COMMON_CLIENT_SECRET', width)}` +
       `=> *****\n`;
    msg += ` ${padRight('ALFRED_SERVICES_AUTH', width)}` +
       `=> ${this.authUri}\n`;
    msg += ` ${padRight('ALFRED_SERVER_PORT', width)}` +
       `=> ${this.serverPort}\n`;
    msg += ` ${padRight('ALFRED_SESSION_ENABLE_CLEANUP', width)}` +
       `=> ${this.enableCleanup}\n`;
    msg += ` ${padRight('ALFRED_SESSION_CLEANUP_DELAY', width)}` +
       `=> ${this.cleanupDelay || '-'}\n`;
    msg += ` ${padRight('ALFRED_SESSION_CLEANUP_INTERVAL', width)}` +
       `=> ${this.cleanupInterval || '-'}\n`;
    msg += ` ${padRight('ALFRED_SESSION_CONNECTION_RECORD_TTL', width)}` +
       `=> ${this.connectionRecordTTL || '-'}\n`;
    msg += ` ${padRight('ALFRED_SESSION_CONNECTION_RECORD_RERFRESH_INTERVAL', width)}` +
       `=> ${this.connectionRecordRefreshInterval || '-'}\n`;
    msg += '[=-----------------------------------------------------------------------=]';
    log.debug(msg);
  }
}

export {Config};
