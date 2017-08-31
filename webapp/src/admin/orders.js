import React, { Component } from 'react';
const ReactDOM = require('react-dom');

import R from 'ramda';

const axios = require('axios');

const ReactDataGrid = require('../../react-data-grid/packages/react-data-grid/dist/react-data-grid');
const Toolbar = require('../react-data-grid-override/GridToolbarRequests');
import Selectors from '../react-data-grid-override/Selectors';

class RowRenderer extends Component {

  setScrollLeft(scrollBy) {
    this.row.setScrollLeft(scrollBy);
  }

  getClassName() {
    return this.props.row.deleted ?  'line-through' : '';
  }

  render() {
    const Row = ReactDataGrid.Row;
    return (<div className={this.getClassName()}><Row ref={ node => this.row = node } {...this.props}/></div>);
  }
};

class DetailsFormatter extends Component {
  onClick() {
    this.props.onClick(this);
  }

  render() {
    return (
      <div style={{textAlign: 'center', cursor: 'pointer'}}
           onClick={this.onClick}>
        <i className="fa fa-search"></i>
      </div>
    )
  }
};

class OrderEditor extends Component {
  onClick(e) {
    e.stopPropagation();
  }
  onChange(e) {
    this.props.onChange(this);
  }
  onMouseOver(e) {
    e.stopPropagation();
  }

  render() {
    const options = this.props.value.map((outbound, index)=>{
    //const options = this.props.rowData.outbound.map((outbound, index)=>{
      return (<option key={index}>{outbound}</option>)
    })
    return (
      <div style={{textAlign: 'center'}}
           onMouseOver={this.onMouseOver}
           onClick={this.onClick}
           onChange={this.onChange.bind(this)}>
        <select style={{width: '90%'}} ref={ node => this.selectRef = node }>
          <option value=''>选择操作</option>
          <option value='reset'>重置(慎用)</option>
          {options}
        </select>
      </div>
    )
  }
};

class GridAdminOrders extends Component {
  constructor(props) {
    super(props);

    this._columns = [
      { key: 'details', name: '', editable: false, width: 40, locked: true, formatter: <DetailsFormatter onClick={this.handleDetailsClick} {...this.props} {...this.state}/>},
      { key: 'inbound', name: '订单状态', editable: false, width: 100},
      { key: 'outbound', name: '状态操作', editable: false, formatter: <OrderEditor onChange={this.handleOrderChange.bind(this)} />, width: 100},
      { key: 'guestWechat', name: '房客微信', editable: true, width: 100},
      { key: 'usd2jpy', name: 'JPY', editable: true, width: 50},
      { key: 'usd2cny', name: 'CNY', editable: true, width: 50},
      { key: 'host_airbnb_pk', name: 'airbnb_pk', editable: true, width: 100},
      { key: 'host_id', name: 'host_id', editable: true, width: 100},
      { key: 'startDate', name: '入住', editable: true, width: 100},
      { key: 'endDate', name: '退房', editable: true, width: 100},
      { key: 'numberOfNights', name: '晚数', editable: true, width: 50},
      { key: 'numberOfAdults', name: '成人数', editable: true, width: 50},
      { key: 'numberOfKids', name: '儿童数', editable: true, width: 50},
      { key: 'numberOfBabies', name: '婴儿数', editable: true, width: 50},
      { key: 'priceCleaning', name: '清洁费', editable: true, width: 50},
      { key: 'priceExtraPersonTotal', name: '超员费', editable: true, width: 50},
      { key: 'priceNights', name: '住宿费', editable: true, width: 50},
      { key: 'priceTotal', name: '订单总价', editable: true, width: 50},
    ];

    this._columns.forEach((col)=>{
      col.filterable = true;
      col.sortable = true;
      col.resizable = true;
    });

    this.state = {
      api: 'http://' + window.location.hostname + ':8000',
      rows: [],
      selectedIndexes: [],
      loading: false,
      filters: {},
      sortColumn: null,
      sortDirection: null,
    };
  }

  handleOrderChange(orderEditor) {
    const api = this.state.api;
    let com = this;
    let rowIdx = orderEditor.props.rowIdx;
    let action = orderEditor.selectRef.value;
    let row = this.getRows()[rowIdx];
    //console.log(rowIdx, action, row);

    axios
      .post(api + '/order/proceed', {
        data: {
          action: action,
          _id: row._id
        }
      }, {
        withCredentials: true
      })
      //.get('http://106.14.204.221:8000/host')
      .then(function(response) {
        console.log('received', response.data);
        //com.setState({rows: response.data});
        let rows = R.clone(com.getRows());
        rows[rowIdx] = R.merge(rows[rowIdx], response.data);
        com.setState({ rows });
        orderEditor.selectRef.value = '';
      });
  }

  getRows() {
    return Selectors.getRows(this.state);
  }

  getSize() {
    return this.getRows().length;
  }

  rowGetter(i) {
    const row = this.getRows()[i];
    if (!row.inbound) row.inbound = 'unknown';
    if (!row.outbound) row.outbound = [];
    return row;
  }

  onRowsSelected(rows) {
    this.setState({selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))});
  }

  onRowsDeselected(rows) {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({selectedIndexes: this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1 )});
  }

  handleFilterChange(filter) {
    let newFilters = Object.assign({}, this.state.filters);
    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }
    this.setState({ filters: newFilters });
  }

  onClearFilters() {
    // all filters removed
    this.setState({filters: {} });
  }

  handleDetailsClick(r) {
    console.log('details');
  }

  handleSave() {
    console.log('save');
  }

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
  }

  handleMatch() {
    console.log('match');
  }

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
            rowGetter={this.rowGetter.bind(this)}
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
  }

  componentWillMount() {
    let com = this;
    const api = this.state.api;
    axios
      .get(api + '/order', {
        withCredentials: true
      })
      //.get('http://106.14.204.221:8000/host')
      .then(function(response) {
        com.setState({rows: response.data});
      });
  }

  componentDidMount() {
    this.grid.onToggleFilter();
  }
};

class AdminOrders extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div>
        <GridAdminOrders/>
      </div>
    )
  }

  componentWillMount() {
    this.props.updateAppTitle('订单管理');
  }
}

export default AdminOrders;
