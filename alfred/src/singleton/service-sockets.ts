
import * as logger      from 'logger';
import * as WebSocket   from 'ws';
import * as events 		from 'events';


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
		this.service = service;
	}

	createSocket = () => {
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
	request: 		string;
    uuid:           string;
    answers:        string[] = [];
    ws:             ServiceSocket[];
    requestSent:    number = 0;
    answerReceived: number = 0;
	
    constructor(request: string, ws: ServiceSocket[]) {
        this.ws = ws;
        this.uuid = require('uuid/v4')();
		this.request = request;
    }

	run() : any {
		return new Promise((resolve, reject) => {
			this.ws.forEach((s) => {
				if (s.isActive && s.service.ws && s.socket) {
					try {
						s.socket.on('message', (msg: any) => {
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
								resolve();
							}
						});
						this.requestSent ++;
						s.socket.send(JSON.stringify({uuid: this.uuid, txt: this.request}));
					} catch (e) {
						log.error('arf');
					}
				}
			});
			setTimeout(() => {
				resolve();
			}, 5000);
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
    } else {
        serviceSocket.service = service;
    }
    serviceSocket.createSocket();
    _serviceSockets.push(serviceSocket);
    return serviceSocket;
};

export const serviceSockets = {
    get: getSocketforService,
    add: createSocketforService,
    push: createSocketforService,
    getAll: () => { return _serviceSockets; },
    proceedRequest: (request) : any => {
		const eventEmitter = new events.EventEmitter();
		eventEmitter.on('socketMessageReceived', (msg) => {
			log.info(JSON.stringify(msg));
 		});
        const sR = new ServiceRequest(request, _serviceSockets);
        _serviceRequests[sR.uuid] = sR;
		
		return sR.run().then(() => {
			const answer = { uuid: sR.uuid, answer: sR.answers.join('\n') };
            delete _serviceRequests[sR.uuid];
			return answer;
		});
    }
};

/*
 log.info('[' + sR.uuid + ']' + '=> ' + JSON.stringify(answer));
            response.json(answer);
*/
