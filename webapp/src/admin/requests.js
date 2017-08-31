import React, { Component } from 'react';

import R from 'ramda';

const axios = require('axios');

const ReactDataGrid = require('../../react-data-grid/packages/react-data-grid/dist/react-data-grid');
const Toolbar = require('../react-data-grid-override/GridToolbarRequests');
import Selectors from '../react-data-grid-override/Selectors';

const RowRenderer = React.createClass({

  setScrollLeft(scrollBy) {
    this.row.setScrollLeft(scrollBy);
  },

  getClassName() {
    return this.props.row.deleted ?  'line-through' : '';
  },

  render: function() {
    const Row = ReactDataGrid.Row;
    return (<div className={this.getClassName()}><Row ref={ node => this.row = node } {...this.props}/></div>);
  }
});

const GridAdminRequests = React.createClass({

  getInitialState() {
    this._columns = [
      { key: 'matched', name: '匹配数', editable: true, width: 50},
      { key: 'wechatBroker', name: '委托人微信', editable: true, width: 100},
      { key: 'wechatGuest', name: '客户微信', editable: true, width: 100},
      { key: 'startDate', name: '入住日期', editable: true, width: 100},
      { key: 'endDate', name: '退房日期', editable: true, width: 100},
      { key: 'city', name: '城市', editable: true, width: 100},
      { key: 'area', name: '区域', editable: true, width: 100},
      { key: 'numberOfGuests', name: '人数', editable: true, width: 100},
      { key: 'budget', name: '预算', editable: true, width: 100},
      { key: 'memo', name: '备注', editable: true},
    ];

    this._columns.forEach((col)=>{
      col.filterable = true;
      col.sortable = true;
      col.resizable = true;
    });

    return {
      api: 'http://' + window.location.hostname + ':8000',
      rows: [],
      selectedIndexes: [],
      loading: false,
      filters: {},
      sortColumn: null,
      sortDirection: null,
    };
  },

  getRows() {
    return Selectors.getRows(this.state);
  },

  getSize() {
    return this.getRows().length;
  },

  rowGetter(i) {
    const row = this.getRows()[i];
    row.matched = 0;
    return row;
  },

  onRowsSelected(rows) {
    this.setState({selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))});
  },

  onRowsDeselected(rows) {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({selectedIndexes: this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1 )});
  },

  handleFilterChange(filter) {
    let newFilters = Object.assign({}, this.state.filters);
    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }
    this.setState({ filters: newFilters });
  },

  onClearFilters() {
    // all filters removed
    this.setState({filters: {} });
  },

  handleSave() {
    console.log('save');
  },

  handleDelete() {
    console.log('delete');
    if (this.state.selectedIndexes.length === 0) {
      alert('Nothing to be deleted');
      return;
    }
    if (!confirm('Are you sure to delete rows?')) return;
    const com = this;
    let rows = R.clone(this.getRows());
    console.log('x', com.getRows().length)
/*
    const data = R.map((index) => {
      var nth = R.nth(index, com.getRows());
      rows[index].deleted = true;
      console.log('delete', nth.airbnb_pk)
      return nth._id
    })(this.state.selectedIndexes);
    console.log('y', rows.length)
    const api = this.state.api;
    axios
      .delete(api + '/request', {data: data}, {
        withCredentials: true
      })
      .then(function(response) {
        //confirm(com.state.selectedIndexes.length + ' rows deleted');
        console.log('deleted', response.data)
        com.setState({
          selectedIndexes: [],
          rows: rows,
        })
      });
*/
        com.setState({
          selectedIndexes: [],
          rows: rows,
        })
  },

  handleMatch() {
    console.log('match');
  },

  render() {

    return  (
      <div>
        <div className="spinner">
          <span
            style={ this.state.loading ? {} : {display: 'none'}}
            ref={ node => this.spinner = node } />
        </div>
        <div>
          <ReactDataGrid
            ref={ node => this.grid = node }
            enableCellSelect={true}
            columns={this._columns}
            rowGetter={this.rowGetter}
            rowsCount={this.getSize()}
            minHeight={window.innerHeight - 70}
            rowHeight={25}
            toolbar={<Toolbar
                onSave={this.handleSave}
                onDelete={this.handleDelete}
                onMatch={this.handleMatch}
                selectedIndexes={this.state.selectedIndexes}
                rows={this.state.rows}
                enableFilter={true}
            />}
            onGridRowsUpdated={this.handleGridRowsUpdated}
            rowSelection={{
              showCheckbox: true,
              enableShiftSelect: true,
              onRowsSelected: this.onRowsSelected,
              onRowsDeselected: this.onRowsDeselected,
              selectBy: {
                indexes: this.state.selectedIndexes
              }
            }}
            rowRenderer={RowRenderer}
            onAddFilter={this.handleFilterChange}
            onClearFilters={this.onClearFilters}
            onGridSort={this.handleGridSort}
            onRowClick={this.handleRowClick}
            />
        </div>
      </div>
    )
  },

  componentWillMount() {
    let com = this;
    const api = this.state.api;
    axios
      .get(api + '/request', {
        withCredentials: true
      })
      //.get('http://106.14.204.221:8000/host')
      .then(function(response) {
        com.setState({rows: response.data});
      });
  },

  componentDidMount() {
    this.grid.onToggleFilter();
  }
});

class AdminRequests extends Component {
  render() {
    return (
      <div>
        <GridAdminRequests/>
      </div>
    )
  }

  componentWillMount() {
    this.props.updateAppTitle('代理需求管理');
  }
}

export default AdminRequests;
