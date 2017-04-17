import { combineReducers } from 'redux';
import logReducer from './logs-reducer';

const rootReducer = combineReducers({
 logs:  logReducer
});

export default rootReducer;