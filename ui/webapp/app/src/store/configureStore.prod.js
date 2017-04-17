import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import socketMiddleware from '../middleware/socketMiddleware';

let middleware = [ socketMiddleware ];
const enhancer = applyMiddleware(...middleware);

export default function configureStore(initialState) {
 return createStore(rootReducer, initialState, enhancer);
};