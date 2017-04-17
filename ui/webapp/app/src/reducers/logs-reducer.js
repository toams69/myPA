import { CONNECTED, CONNECTING, DISCONNECTED, MESSAGE_RECEIVED, CLEAR_MESSAGES} from '../actions/actions';

const INITIAL_STATE = {
  connected: false,
  loading: false,
  data: []
};

export default function(state = INITIAL_STATE, action) {
  switch(action.type) {
    case CONNECTING:
      return {...state,
        loading: true
      };
    case CONNECTED:
      return {...state,
        connected: true
      };
    case DISCONNECTED:
      return {...state,
        connected: false,
        loading: false
      };
    case MESSAGE_RECEIVED:
      return {...state,
        loading: false,
        data: [...action.logs]
      };
    case CLEAR_MESSAGES: 
      return {...state,
        data: []
      };
    default:
    return state;
  }
}