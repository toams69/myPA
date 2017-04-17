const WebSocketServer   = require('ws').Server;
const fs                = require('fs');
const path              = require('path');
const controller        = require('./controller');

const options = {
    port: 3000
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

const server = new WebSocketServer({port: options.port});
console.info(`Listening on ${options.port}`);
const subscribers = new Set();

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
                console.log("<- ["+uuid+"]" + message);
                proceedRequest(message.txt, message.uuid, ws);
            }
        } catch (e) {
           
        }
    });
});

/* Initiate connection to the aggregator core :) */

proceedRequest("Quelle est la météo", 12345, {});