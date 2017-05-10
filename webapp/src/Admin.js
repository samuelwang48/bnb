import React, { Component } from 'react';
const ReactDataGrid = require('react-data-grid');
const exampleWrapper = require('./components/exampleWrapper');

const Example = React.createClass({
  getInitialState() {
    this.createRows();
    this._columns = [
      { key: 'id', name: 'ID' },
      { key: 'title', name: 'Title' },
      { key: 'count', name: 'Count' } ];

    return null;
  },

  createRows() {
    let rows = [];
    for (let i = 1; i < 1000; i++) {
      rows.push({
        id: i,
        title: 'Title ' + i,
        count: i * 1000
      });
    }

    this._rows = rows;
  },

  rowGetter(i) {
    return this._rows[i];
  },

  render() {
    return  (
      <ReactDataGrid
        columns={this._columns}
        rowGetter={this.rowGetter}
        rowsCount={this._rows.length}
        minHeight={500} />);
  }
});


class Admin extends Component {
  render() {
    return (
      <div>
        <h2>Admin</h2>
        <div>
          <Example>
          </Example>
        </div>
      </div>
    )
  }
}

export default Admin;
