import * as amp from 'app-module-path';
amp.addPath(__dirname);

import {Request, Response}              from 'express-serve-static-core';
import {Server as HttpServer}           from 'http';
import {Server as HttpsServer}          from 'http';
import {argv}                           from 'optimist';
import * as bodyParser                  from 'body-parser';
import * as compression                 from 'compression';
import * as express                     from 'express';
import * as fs                          from 'fs';
import * as http                        from 'http';
import * as https                       from 'https';
import * as path                        from 'path';
// import * as passport                from 'passport';
import * as SwaggerExpress              from 'swagger-express-mw';
import * as SwaggerUi                   from 'swagger-tools/middleware/swagger-ui';
// import {adminRouter}                from 'admin-router';
// import {StatusCode}                 from 'api/status-code';
// import {passportConfig}             from 'auth/passport-config';
// import {contextManager}             from 'context/context-manager';
// import {expressMiddleware as zkm}   from 'expressMiddleware';
// import {metricsMiddleware}          from 'metrics/request-metrics';
// import {sessionManager}             from 'session/session-manager-singleton';
// import * as userController          from 'api/controllers/user';
// import * as sessionMiddleware       from 'auth/session-middleware';
import {ConfigInterface}                from 'conf/Config';
import * as conf                        from 'conf/configuration';
// import * as contextMiddleware       from 'context/context-middleware';
import * as logger                      from 'logger';
import {serviceSockets, AlfredService}  from 'singleton/service-sockets';


const log = logger.child({from: 'app'});
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
  } catch (e) {
    log.warn('Failed to read server version.', e);
  }

  return buildInfo;
};

const createExpressApp = (conf: ConfigInterface) => {
  const app = express();
  app.set('json spaces', 2);
  app.use(bodyParser.json({limit: '20mb'}));
  // app.use(sessionMiddleware);
  // app.use('/alfred-api/*', metricsMiddleware);
  app.use(compression());

  if (conf.enableCors && conf.corsAllowedOrigins) {
    app.use(function (req: Request, res: Response, next: () => void): void {
      res.header('Access-Control-Allow-Origin', conf.corsAllowedOrigins);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept, x-b3-spanid, x-b3-traceid');
      next();
    });
  }

  app.use(function (req: Request, res: Response, next: () => void): void {
    req.route = {path: req.path};
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

//   app.use('/alfred-api/login', userController.login);
  
  app.use('/alfred-api/*', (request: Request, response: Response, next: (err?: any) => void) => {
    let baseUrl = request.baseUrl;
    if (baseUrl.startsWith('/alfred-api/explore') 
     || baseUrl.startsWith('/alfred-api/doc')
     || baseUrl.startsWith('/alfred-api/login')) {
      next();
    } else if (request.method === 'OPTIONS') {
      response.end();
    } else {
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

const createServer = (app, conf: ConfigInterface): HttpServer | HttpsServer => {
  let server;

  if (argv.https) {
    const httpsConfig = conf._getSection('https');
    app.locals.protocol = 'https';
    server = https.createServer({
      cert: fs.readFileSync(httpsConfig.cert),
      key: fs.readFileSync(httpsConfig.key)
    }, app);
  } else {
    app.locals.protocol = 'http';
    server = http.createServer(app);
  }

  return server;
};

let createSwaggerExpress = (conf: ConfigInterface): Promise<any> => {
  const config = {
    appRoot: path.resolve(__dirname),
    configDir: path.resolve(__dirname, 'config')
  };

  return new Promise((resolve, reject) => {
    SwaggerExpress.create(config, (err: boolean, swaggerExpress: any): void => {
      if (err) {
        log.error('failed to create swagger app:', err);
        throw err;
      }
      resolve(swaggerExpress);
    });

  });

};

export const startApp = (conf: ConfigInterface): Promise<HttpServer | HttpsServer> => {
  let buildInfo = getBuildInfo();
  let version;
  if (!buildInfo.version || buildInfo.version === 'development build') {
    version = '(development build)';
  } else {
    version = `v${buildInfo.version}`;
    if (buildInfo.changeset) {
      version += `.${buildInfo.changeset}`;
    }
  }
  log.debug(`Alfred Service is starting... ${version}`);
  
  conf.printConfig();

  const app = createExpressApp(conf);

  return createSwaggerExpress(conf).then((swaggerExpress: any) => {
    app.use(SwaggerUi(swaggerExpress.runner.swagger, { 
      apiDocs: '/alfred-api/doc',
      swaggerUi: '/alfred-api/explore'
    }));
    swaggerExpress.register(app);
    
    let server = createServer(app, conf);
    let port = app.get('port');

    server.listen(port, function (): void {
      log.info(`Server running on port ${port}.`);
    });

    return server;
  });

};



import * as redis         from 'redis';

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
        case 'addService' :
          serviceSockets.add(new AlfredService(obj.name, obj.host, obj.port, obj.version, obj.ws));
          break;
        default:
          log.info('unknow message type');
      }
    } catch (e) {
      log.info('error during parse ' + e);
    }
});


if (require.main === module) {
  startApp(conf);
}
