import React, { Component } from 'react';
import R from 'ramda';

const axios = require('axios');
const ReactDataGrid = require('react-data-grid');
const Toolbar = require('./GridToolbar');

const exampleWrapper = require('./components/exampleWrapper');

const Example = React.createClass({

  getInitialState() {
    this._columns = [
      { key: 'airbnb_pk', name: 'airbnb_pk', editable: true, },
      { key: 'wechat',    name: 'wechat',    editable: true, },
      { key: 'region',    name: 'region',    editable: true, },
      { key: 'city',      name: 'city',      editable: true, },
      { key: 'area',      name: 'area',      editable: true, },
      { key: 'bedroom',   name: 'bedroom',   editable: true, },
      { key: 'bed',       name: 'bed',       editable: true, },
    ];

    let rows = [];

    return {
      rows: rows
    };
  },

  rowGetter(i) {
    return this.state.rows[i];
  },

  getSize() {
    return this.state.rows.length;
  },

  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    let rows = this.state.rows.slice();

    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = rows[i];
      let updatedRow = R.merge(rowToUpdate, updated);
      rows[i] = updatedRow;
      console.log(rows[i], i)
    }

    this.setState({ rows });
  },

  handleAddRow({ newRowIndex }) {
    const newRow = {
      'airbnb_pk': '',
      'wechat': '',
      'region': '',
      'city': '',
      'area': '',
      'bedroom': 0,
      'bed': 0,
    };

    let rows = this.state.rows.slice();
    rows = R.append(newRow, rows);
    this.setState({ rows });
  },

  handleSave() {
    console.log('save', this.state.rows);
    axios
      .post('http://' + window.location.hostname + ':8000/host', {data: this.state.rows})
      .then(function(response) {
        console.log('saved', response.data)
      });
  },

  render() {

    return  (
      <ReactDataGrid
        ref={ node => this.grid = node }
        enableCellSelect={true}
        columns={this._columns}
        rowGetter={this.rowGetter}
        rowsCount={this.getSize()}
        minHeight={500}
        toolbar={<Toolbar onAddRow={this.handleAddRow} onSave={this.handleSave}/>}
        onGridRowsUpdated={this.handleGridRowsUpdated}
      />);
  },

  componentDidMount() {
    let com = this;
    axios
      .get('http://' + window.location.hostname + ':8000/host')
      .then(function(response) {
        console.log(response.data)
        com.setState({rows: response.data});
      });
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
