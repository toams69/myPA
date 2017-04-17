import React from 'react';
import { Component } from 'react';
import Grid from './common/Grid';

export default class Logs extends Component {
  state = {
    filter: ""
  };

  onStartClicked() {
    const { start } = this.props;
    start();
  }

  onStopClicked() {
    const { stop } = this.props;
    stop();
  }

  onClearClicked() {
    const { clear } = this.props;
    clear();
  }

  onFilterChange(event) {
    this.setState({filter: event.target.value});
  }

  applyFilter(logsList) {
    if (logsList) {
      return logsList.filter(log => {
        let test = false;
        Object.keys( log ).forEach( key => {
          if (log[key] && typeof log[key].toLowerCase === "function" && log[key].toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1)  {
            test = true;
          }
        });
        return test;
      });
    }
    return logsList;
  }

  render() {
    const { socket, dispatch, logs } = this.props;
    const filteredData = this.applyFilter(logs.data);
    return (
      <div className="logs-component">
        <div className="cssload-loader"></div>
        <div className="header">
          {logs && logs.connected === false ?
            <button className="fa fa-play" title="Start watching" onClick={this.onStartClicked.bind(this)}></button> 
            :
            <button className="fa fa-stop" title="Stop websocket" onClick={this.onStopClicked.bind(this)}></button>
          }
          <input type="text" placeholder="filter" onChange={this.onFilterChange.bind(this)}/>
          <button className="fa fa-trash" title="clear" onClick={this.onClearClicked.bind(this)}></button>
        </div>
        <div className="content">
          {
            logs && logs.loading === true ? 
              <div className="logs-component"><div className="cssload-loader"></div></div>
            :
            filteredData && filteredData.length ?
              <Grid jsonData={filteredData} header={["date", "serverName",	"processName", "processId", "content"]}/> 
              : 
              null
          }
        </div>
      </div>
    );
  }
}