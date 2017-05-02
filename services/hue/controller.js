var hue     = require('node-hue-api');
var HueApi  = hue.HueApi;
// TODO conf file
const PHILIPS_USERNAME = "foMc0qnDL98IkeiZfUFZjmz3m4xuLqn1pV3UYi6b";
const lightState = hue.lightState;
let api = null;
let state = null;


hue.nupnpSearch().then(function(result){
    if ( result.length ) {
        var bridge = result[0];
        api = new HueApi(bridge.ipaddress, PHILIPS_USERNAME);
        state = lightState.create();
    }
}, function(){
});

getLights = () => {
    if ( api && api.version() ) {
        return api.lights();
    } else {
        return null;
    }
}


const controller = {
    setLightsOn: (response, lang) => {
        const promise = getLights();
        if (promise) {
            promise.then((data) => {
                
                data.lights.forEach((light) => {
                    if (light.state && light.state.reachable && !light.state.on) {
                        console.log("ok "+ light.id);
                        api.setLightState(light.id, state.on());
                    }
                });
            })
        }
        return response;
    },
    setLightsOff: (response, lang) => {
        const promise = getLights();
        if (promise) {
            promise.then((data) => {
                data.lights.forEach((light) => {
                    if (light.state && light.state.reachable && light.state.on) {
                        console.log("ok "+ light.id);
                        api.setLightState(light.id, state.off());
                    }
                });
            })
        }
        return response;
    }
};
exports = module.exports = controller;