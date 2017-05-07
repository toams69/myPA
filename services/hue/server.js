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

String.prototype.toLowerCaseWithoutAccent = function(){
    var accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    var noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];
    var str = this;
    for(var i = 0; i < accent.length; i++){
        str = str.replace(accent[i], noaccent[i]);
    }
    str = str.toLowerCase();
     
    return str;
}

const proceedRequest = (message, uuid, ws) => {
    const response = {uuid: uuid};

    // find correct controller and call it with random response
    let operation = null;
    if (message) {
        parsers.forEach((p) => {
            operation = operation || 
                p.find((operation) => {
                    return operation.requests.find( (r) => {
                        return (r.toLowerCaseWithoutAccent() === message.toLowerCaseWithoutAccent()); // TODO improve this part to find the txt
                    });
                });
        });
    }

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
        ws.send(JSON.stringify(response));
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
                message = JSON.parse(message);
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
            host:       'localhost',
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