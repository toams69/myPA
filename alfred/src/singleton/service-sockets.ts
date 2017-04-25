
import * as logger      from 'logger';
import * as WebSocket   from 'ws';
import {StatusCode}     from 'api/status-code';


const log = logger.child({from: 'app-service-sockets'});

export interface ServiceSocketInterface {
  socket:       any;
  service:      AlfredService;
}

interface AlfredServiceInterface {
    name:    string;
    ws:      boolean;
    host:    string;
    port:    number;
    version: string;
}

export class AlfredService implements AlfredServiceInterface {
    name:    string;
    ws:      boolean;
    host:    string;
    port:    number;
    version: string;
    constructor(name: string, host: string, port: number, version: string, ws?: boolean) {
        this.name = name;
        this.host = host;
        this.ws = ws;
        this.port = port;
        this.version = version;
    }
}

export class ServiceSocket implements ServiceSocketInterface {
  socket: any = null;
  isActive: boolean = false;
  service: AlfredServiceInterface = null;

  constructor(service: AlfredServiceInterface) {
    //this.socket = new WebSocket(url);
    this.service = service;

    if (this.service.ws) {
        this.socket = new WebSocket('ws://' + this.service.host + ':' + this.service.port);
        this.socket.on('open', () : void => {
            log.info('connected on service: ' + this.service.name);
            this.isActive = true;
        });
        this.socket.on('close', () : void => {
            log.info('service: ' + this.service.name + ' lost');
            this.isActive = false;
        });
    }
  }
}


class ServiceRequest {
    uuid:           string;
    answers:        string[] = [];
    ws:             ServiceSocket[];
    requestSent:    number = 0;
    answerReceived: number = 0;
  
    constructor(request: string, ws: ServiceSocket[]) {
        this.ws = ws;
        this.uuid = require('uuid/v4')();

        this.ws.forEach((s) => {
            if (s.isActive && s.service.ws && s.socket) {
                try {
                    s.socket.on('message', (msg: any) : void => {
                        try {
                            const obj = JSON.parse(msg);
                            if (obj.txt) {
                                this.answers.push(obj.txt);
                            }
                        } catch (e) {
                            log.error('arf');
                        }
                        this.answerReceived ++;
                        if (this.answerReceived === this.requestSent) {
                            log.info('all service ok');
                        }
                    });
                    this.requestSent ++;
                    s.socket.send(JSON.stringify({uuid: this.uuid, txt: request}));
                } catch (e) {
                    log.error('arf');
                }
            }
        });
    }
}

const _serviceSockets = new Array<ServiceSocket>();
const _serviceRequests = {};

const getSocketforService = (serviceName: string) => {
    return _serviceSockets.find((serviceSocket) => {
        return serviceSocket.service.name === serviceName;
    });
};

const createSocketforService = (service: AlfredServiceInterface) => {
    let serviceSocket = getSocketforService(service.name);
    if (!serviceSocket) {
       serviceSocket = new ServiceSocket(service);
    }
    _serviceSockets.push(serviceSocket);
    return serviceSocket;
};

export const serviceSockets = {
    get: getSocketforService,
    add: createSocketforService,
    push: createSocketforService,
    getAll: () => { return _serviceSockets; },
    proceedRequest: (request, response) => {
        const sR = new ServiceRequest(request, _serviceSockets);
        _serviceRequests[sR.uuid] = sR;
        setTimeout(() => {
            const answer = { status: { code: StatusCode.OK }, data: { 'msg': sR.answers.join('\n') }};
            log.info('[' + sR.uuid + ']' + '=> ' + JSON.stringify(answer));
            response.json(answer);
            delete _serviceRequests[sR.uuid];
        }, 5000);
        return sR.uuid;

        // once all done send response
    }
};
