import React from 'react';
import { Component } from 'react';
import LogsContainer from '_containers/LogsContainer';
import PropTypes from 'prop-types';


export default class Index extends Component {

  static contextTypes = {
   	router: PropTypes.object
  };

  componentDidMount() {
    
  }

  render() {
    return (
      <LogsContainer>
         
      </LogsContainer>
    );
  }
}
