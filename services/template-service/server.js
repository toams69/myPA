const WebSocketServer   = require('ws').Server;
const fs                = require('fs');
const path              = require('path');
const controller        = require('./controller');
const product           = require('./package.json');
const redis             = require('redis');

const options = {
    ports: [3000, 3001, 3002]
};

var walk = function(dir, filelist) {
	const files = fs.readdirSync(dir);
	filelist = filelist || [];
	files.forEach(function(file) {
		if (fs.statSync(dir + '/' + file).isDirectory()) {
			filelist = walk(dir + '/' + file, filelist);
		}
		else if (file === "parser.json") {
			filelist.push(dir+ '/' + file);
		}
	});
	return filelist;
};

const parsers = [];
walk(path.resolve(__dirname, './parsers')).forEach((parser) => {
    parsers.push(require(parser));
});

const proceedRequest = (message, uuid, ws) => {
    const response = {uuid: uuid};

    // find correct controller and call it with random response
    let operation = null;
    parsers.forEach((p) => {
        operation = operation || 
            p.find((operation) => {
                return operation.requests.find( (r) => {
                    return (r === message); // TODO improve this part to find the txt
                });
            });
    });

    if (operation) {
        const randomAnswer = operation.answers ? operation.answers[Math.floor(Math.random() * operation.answers.length)] : "";
        if (controller[operation.operationId]) { // find correct controller
            response.txt = controller[operation.operationId](randomAnswer) || randomAnswer; // get templated answer if needed
        } else { // if no controller found a random answer is sent based on the parser
            response.txt = randomAnswer;
        }
    } else {
        response.txt = "";
    }
    
    try {
        ws.send(response);
        console.log("-> ["+uuid+"] " + JSON.stringify(response));
    } catch (e) {
        console.log("<X> ERROR on send ["+uuid+"] " + JSON.stringify(response));
    }
};

let server = null;
let index = 0;

const createWebSocketServer = (port) => {
    server = new WebSocketServer({port: port});

    server.on('listening', (err) => {
        console.info(`Listening on ${port}`);
        startBinding(server);
    });

    server.on('error', (err) => {
        if (index < options.ports.length) {
            index++;
            createWebSocketServer(options.ports[index]);
        } else {
            if (!server) {
                console.log("Can't start webserver");
                throw "no available port";
            }
        }
    });
}

const startBinding = (server) => {
    const subscribers = new Set();
    const client = redis.createClient();
    server.on('connection', (ws) => {
        console.log('<-> New connection to service.');
        subscribers.add(ws);

        ws.on('close', () => {
            console.log('<X> Connection lost.');
            subscribers.delete(ws);
        });

        ws.on('message', (message) => {
            try {
                JSON.parse(message);
                if (message.uuid) {
                    console.log("<- ["+message.uuid+"]" + message);
                    proceedRequest(message.txt, message.uuid, ws);
                }
            } catch (e) {
            
            }
        });
    });

    const publish = (c) => {
        console.log('-> publish service to redis');
        c.publish('__services_channel', JSON.stringify({
            type:       'addService',
            name:       product.name,
            ws:         true,
            port:       options.ports[index],
            version:    product.version
        }));
        c.quit();
    };
    client.on('message', (channel, message) => {
        setTimeout(() => publish(redis.createClient()), 500)
    });
    client.on('ready', () => {
        client.subscribe('__alfred_channel');
    });
    publish(redis.createClient());
}

// Start the listening
createWebSocketServer(options.ports[index]);