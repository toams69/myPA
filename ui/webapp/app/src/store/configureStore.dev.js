import { createStore, applyMiddleware, compose } from 'redux';
import socketMiddleware from '../middleware/socketMiddleware';
import reducer from '../reducers';

export default function configureStore(initialState) {
  let middleware = [ socketMiddleware ];
  const finalCreateStore = compose(
    applyMiddleware(...middleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )(createStore);

  const store = finalCreateStore(reducer, initialState);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}