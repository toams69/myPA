"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amp = require("app-module-path");
amp.addPath(__dirname);
const optimist_1 = require("optimist");
const bodyParser = require("body-parser");
const compression = require("compression");
const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
// import * as passport                from 'passport';
// import * as socketIO                from 'socket.io';
const SwaggerExpress = require("swagger-express-mw");
const SwaggerUi = require("swagger-tools/middleware/swagger-ui");
const conf = require("conf/configuration");
// import * as contextMiddleware       from 'context/context-middleware';
const logger = require("logger");
const redis = require("redis");
const log = logger.child({ from: 'app' });
// passportConfig(passport);
const getBuildInfo = () => {
    let buildInfo = {
        version: '-',
        changeset: '-'
    };
    try {
        let filePath = path.resolve(__dirname, './info.json');
        let data = fs.readFileSync(filePath, 'utf8');
        buildInfo = JSON.parse(data);
    }
    catch (e) {
        log.warn('Failed to read server version.', e);
    }
    return buildInfo;
};
const createExpressApp = (conf) => {
    const app = express();
    app.set('json spaces', 2);
    app.use(bodyParser.json({ limit: '20mb' }));
    // app.use(sessionMiddleware);
    // app.use('/alfred-api/*', metricsMiddleware);
    app.use(compression());
    if (conf.enableCors && conf.corsAllowedOrigins) {
        app.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', conf.corsAllowedOrigins);
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept, x-b3-spanid, x-b3-traceid');
            next();
        });
    }
    app.use(function (req, res, next) {
        req.route = { path: req.path };
        next();
    });
    //   app.use(passport.initialize());
    //   app.use(passport.session());
    //   app.use(contextMiddleware);
    //   contextManager.initialize();
    //   sessionManager.initialize();
    const port = conf.serverPort;
    app.set('port', port);
    app.set('etag', false);
    app.set('x-powered-by', false);
    // Redis health check.
    app.use('/alfred-api/*', (request, response, next) => {
        //let client  = null;//sessionClient.getClient();
        let baseUrl = request.baseUrl;
        if (baseUrl.startsWith('/alfred-api/explore') || baseUrl.startsWith('/alfred-api/doc')) {
            next();
        }
        else if (request.method === 'OPTIONS') {
            response.end();
            // } else if (client.status !== 'ready') {
            //   let json = { status: { code: StatusCode.RedisDown, message: 'Redis is unavailable'}};
            // //   response.apiError = json;
            //   response.status(503).json(json);
        }
        else {
            next();
        }
    });
    //   app.use('/alfred-api/login', userController.login);
    app.use('/alfred-api/*', (request, response, next) => {
        let baseUrl = request.baseUrl;
        if (baseUrl.startsWith('/alfred-api/explore')
            || baseUrl.startsWith('/alfred-api/doc')
            || baseUrl.startsWith('/alfred-api/login')) {
            next();
        }
        else if (request.method === 'OPTIONS') {
            response.end();
        }
        else {
            //   if (!request.session.loginData || !request.session.loginData.access_token) {
            //     let json = { status: { code: StatusCode.Forbidden, message: 'Unauthorized'}};
            //     response.apiError = json;
            //     response.status(403).json(json);
            //     return;
            //   }
            next();
        }
    });
    return app;
};
const createServer = (app, conf) => {
    let server;
    if (optimist_1.argv.https) {
        const httpsConfig = conf._getSection('https');
        app.locals.protocol = 'https';
        server = https.createServer({
            cert: fs.readFileSync(httpsConfig.cert),
            key: fs.readFileSync(httpsConfig.key)
        }, app);
    }
    else {
        app.locals.protocol = 'http';
        server = http.createServer(app);
    }
    //   const io = socketIO(server, {
    //     path: '/wwe/socket.io',
    //     pingTimeout: conf.socketIoPingTimeout,
    //     pingInterval: conf.socketIoPingInterval,
    //     transports: conf.socketIoTransports,
    //     cookie: conf.socketIoCookie
    //   });
    //   userSockets.initialize(io);
    return server;
};
let createSwaggerExpress = (conf) => {
    const config = {
        appRoot: path.resolve(__dirname),
        configDir: path.resolve(__dirname, 'config')
    };
    return new Promise((resolve, reject) => {
        SwaggerExpress.create(config, (err, swaggerExpress) => {
            if (err) {
                log.error('failed to create swagger app:', err);
                throw err;
            }
            resolve(swaggerExpress);
        });
    });
};
exports.startApp = (conf) => {
    let buildInfo = getBuildInfo();
    let version;
    if (!buildInfo.version || buildInfo.version === 'development build') {
        version = '(development build)';
    }
    else {
        version = `v${buildInfo.version}`;
        if (buildInfo.changeset) {
            version += `.${buildInfo.changeset}`;
        }
    }
    log.debug(`Alfred Service is starting... ${version}`);
    conf.printConfig();
    const app = createExpressApp(conf);
    return createSwaggerExpress(conf).then((swaggerExpress) => {
        app.use(SwaggerUi(swaggerExpress.runner.swagger, {
            apiDocs: '/alfred-api/doc',
            swaggerUi: '/alfred-api/explore'
        }));
        swaggerExpress.register(app);
        let server = createServer(app, conf);
        let port = app.get('port');
        server.listen(port, function () {
            log.info(`Server running on port ${port}.`);
        });
        return server;
    });
};
// Trying to connect to multiple ioServer
// import * as WebSocket  from 'ws';
// interface ServiceSocketInterface {
//   socket:     any;
//   service: string;
// }
// class ServiceSocket implements ServiceSocketInterface {
//   socket: any = null;
//   service: string = '';
//   constructor(socket: any, service: string) {
//     this.socket = socket;
//     this.service = service;
//   }
// }
// const createAPIServiceConnection = (service: string, url: string) : ServiceSocket => {
//   console.log('trying to connect to service: ' + service);
//   const socket = new WebSocket(url);
//   socket.on('open', function() : void {
//     console.log('connected on service: ' + service);
//   });
//   socket.on('close', function() : void {
//     console.log('service: ' + service + ' lost');
//   });
//   return new ServiceSocket(socket, service);
// };
const client = redis.createClient();
client.publish('__alfred_channel', 'Ready.');
client.on('ready', () => {
    client.subscribe('__services_channel');
});
client.on('message', (channel, message) => {
    log.info('[' + channel + '] <= ' + message);
    try {
        const obj = JSON.parse(message);
        switch (obj.type) {
            case 'addService':
                log.info('a new service as been registered');
                break;
            default:
                log.info('unknow message type');
        }
    }
    catch (e) {
        log.info('error during parse ' + e);
    }
});
// const sockets = new Array<ServiceSocket>();
//sockets.push(createAPIServiceConnection('service1', 'ws://localhost:3000'));
//sockets.push(createAPIServiceConnection('service2', 'ws://localhost:3001'));
if (require.main === module) {
    exports.startApp(conf);
}
//# sourceMappingURL=app.js.map