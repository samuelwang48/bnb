import React, { Component } from 'react';

import R from 'ramda';

const axios = require('axios');

const ReactDataGrid = require('../../react-data-grid/packages/react-data-grid/dist/react-data-grid');
const Toolbar = require('../react-data-grid-override/GridToolbarUsers');
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

const DetailsFormatter = React.createClass({
  onClick() {
    this.props.onClick(this);
  },

  render() {
    return (
      <div style={{textAlign: 'center', cursor: 'pointer'}}
           onClick={this.onClick}>
        <i className="fa fa-search"></i>
      </div>
    )
  }
});

const BooleanFormatter = React.createClass({
  onChange() {
    this.props.onChange(this);
  },

  render() {
    return (
      <div>
        <input type="checkbox"
               onChange={this.onChange}
               checked={this.props.value}/>
      </div>
    )
  }
});

const GridAdminUsers = React.createClass({

  getInitialState() {
    let _this = this;

    this._columns = [
      { key: 'details', name: '', editable: false, width: 40, locked: true, formatter: <DetailsFormatter onClick={this.handleDetailsClick} {...this.props} {...this.state}/>},
      { key: 'username', name: 'username', editable: true, width: 40},
      { key: 'password', name: 'password', editable: true, width: 40},
      { key: 'nickname', name: '微信昵称', editable: false, width: 100},
      { key: 'sex',      name: 'sex', editable: false, width: 40},
      { key: 'city',     name: 'city', editable: false, width: 80},
      { key: 'province', name: 'province', editable: false, width: 80},
      { key: 'country',  name: 'country', editable: false, width: 80},
      { key: 'openid',   name: 'openid', editable: false, width: 80},
      { key: 'headimgurl', name: 'headimgurl', editable: false, width: 80},
      { key: 'isBroker', name: '代理权限', editable: true, formatter: <BooleanFormatter onChange={this.handleCheckbox}/>, width: 80},
      { key: 'isAdmin', name: '管理员权限', editable: true, formatter: <BooleanFormatter onChange={this.handleCheckbox}/> },
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

  handleCheckbox(cell) {
    let row = this.getRows()[cell.props.rowIdx];
    let val = cell.props.value === true || cell.props.value === 1 ? 0 : 1;
    row[cell.props.column.key] = val;
    

    let rows = R.clone(this.getRows());
    this.setState({ rows });
  },

  getRows() {
    return Selectors.getRows(this.state);
  },

  getSize() {
    return this.getRows().length;
  },

  rowGetter(i) {
    const row = this.getRows()[i];
    row.isBroker = row.isBroker === true || row.isBroker === 1 ? 1 : 0;
    row.isAdmin = row.isAdmin === true || row.isAdmin === 1 ? 1 : 0;
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

  handleDetailsClick(r) {
    console.log('details');
  },

  handleSave() {
    console.log('save');
    let rows = R.clone(this.getRows());
    const api = this.state.api;
    axios
      .post(api + '/user', {data: rows}, {
        withCredentials: true
      })
      .then(function(response) {
        confirm(response.data.length + ' rows saved');
        console.log('saved', response.data)
      });
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

    const data = R.map((index) => {
      var nth = R.nth(index, com.getRows());
      rows[index].deleted = true;
      console.log('delete', nth.airbnb_pk)
      return nth._id
    })(this.state.selectedIndexes);

    console.log('y', rows.length)
    const api = this.state.api;
    axios
      .delete(api + '/user', {data: data}, {
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
  },

  handleGridRowsUpdated({ fromRow = null, toRow = null, updated = null }) {
    let rows = R.clone(this.getRows());
    fromRow = typeof fromRow === 'undefined' ? 0 : fromRow;
    toRow = typeof toRow === 'undefined' ? rows.length -1 : toRow;
    updated = updated || {};

    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = rows[i];
      let updatedRow = R.merge(rowToUpdate, updated);
      rows[i] = updatedRow;
    }

    this.setState({ rows });
  },

  handleAddRow() {
    const newRow = {
      'username': '',
      'password': '',
      'isBroker': 0,
      'isAdmin': 0,
    };

    let rows = R.clone(this.getRows());
    rows = R.append(newRow, rows);
    this.setState({ rows });
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
                onAddRow={this.handleAddRow}
                onSave={this.handleSave}
                onDelete={this.handleDelete}
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
      .get(api + '/user', {
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

class AdminUsers extends Component {
  render() {
    return (
      <div>
        <GridAdminUsers/>
      </div>
    )
  }

  componentWillMount() {
    this.props.updateAppTitle('用户管理');
  }
}

export default AdminUsers;
