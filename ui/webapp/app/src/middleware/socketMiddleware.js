import {messageReceived, connected, disconnected, connecting, CONNECT, DISCONNECT} from '_actions/actions';

const socketMiddleware = (function(){ 
  var socket = null;

  const onOpen = (ws,store,token) => evt => {
    store.dispatch(connected());
  }

  const onClose = (ws,store) => evt => {
    store.dispatch(disconnected());
  }

  const onMessage = (ws,store) => evt => {
    var msg = JSON.parse(evt.data);
    store.dispatch(messageReceived(msg));
  }

  return store => next => action => {
    switch(action.type) {
      case CONNECT:
        if(socket != null) {
          socket.close();
        }
        store.dispatch(connecting());
        socket = new WebSocket(action.url);
        socket.onmessage = onMessage(socket,store);
        socket.onclose = onClose(socket,store);
        socket.onopen = onOpen(socket,store,action.token);
        break;

      case DISCONNECT:
        if(socket != null) {
          socket.close();
        }
        socket = null;
        store.dispatch(disconnected());
        break;

      default:
        return next(action);
    }
  }

})();

export default socketMiddleware