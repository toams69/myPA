import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';
import configureStore from './store/configureStore.js';
import MainPage from './pages/main';

const store = configureStore();

import createBrowserHistory from 'history/createBrowserHistory';


const browserHistory = createBrowserHistory();

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory} >
        <div>
            <Route path="/" component={MainPage}></Route>
        </div>
    </Router>
  </Provider>
  , document.getElementById('app'));