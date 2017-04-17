import React, { Component } from 'react';
import { connect } from 'react-redux';
import Logs from '../components/Logs.js';
import {disconnectSocket, connectSocket, clearLogs } from '_actions/actions';

const mapDispatchToProps = (dispatch) => {
  return {
  	 start: () => {
      dispatch(connectSocket());
     },
     stop: () => {
       dispatch(disconnectSocket());
     },
     clear: () => {
       dispatch(clearLogs());
     }
  }
}

const mapStateToProps = (state) => {
  return {
    logs: state.logs
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Logs);
