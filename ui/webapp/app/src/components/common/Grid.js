import React from 'react';
import { Component } from 'react';

class Grid extends Component {
  componentWillMount() {
   
  }

  getColumnFromJson(jsonData) {
    const columns = [];
    jsonData.forEach(data => {
      for (let key of Object.keys(data)) {
        if (columns.indexOf(key) === -1) {
          columns.push(key);
        }
      }
    });
    return columns;
  }

  render() {
    const {jsonData, header, selected} = this.props;
    const bodyRows = [];
    
    let columns = header || this.getColumnFromJson(jsonData);
    let headerColums = columns.map(function(col) {
        return (<th key={col}>{col}</th>);
    });

    jsonData.forEach((data, index) => {
        const _columns = [];
        let isSelected = selected && selected === index;
        columns.forEach(c => {
            _columns.push(<td key={index + c}>{data[c]}</td>);
        });
        bodyRows.push(<tr className={isSelected ? "active": ""} key={index}>{_columns}</tr>);
    });

    return (
        <div>
            <table>
            <thead>
                <tr>
                { headerColums}
                </tr>
            </thead>
            <tbody>
                { bodyRows }
            </tbody>
            </table>
        </div>
    );
   }
}

export default Grid;
