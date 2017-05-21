import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import CircularProgress from 'material-ui/CircularProgress';
import Drawer from 'material-ui/Drawer';

import R from 'ramda';

const axios = require('axios');
const ReactDataGrid = require('../react-data-grid/packages/react-data-grid/dist/react-data-grid');
const Toolbar = require('./react-data-grid-override/GridToolbar');
import Selectors from './react-data-grid-override/Selectors';

const { Row } = ReactDataGrid;
const exampleWrapper = require('./components/exampleWrapper');

const DetailsFormatter = React.createClass({
  onClick() {
    this.props.onClick();
  },

  render() {
    return (
      <div style={{textAlign: 'center', cursor: 'pointer'}}
           onClick={this.onClick}>
        <i className="fa fa-window-maximize"></i>
      </div>
    )
  }
});


const RowRenderer = React.createClass({

  setScrollLeft(scrollBy) {
    // if you want freeze columns to work, you need to make sure you implement this as apass through
    this.row.setScrollLeft(scrollBy);
  },

  getClassName() {
    return this.props.row.deleted ?  'line-through' : '';
  },

  render: function() {
    // here we are just changing the style
    // but we could replace this with anything we liked, cards, images, etc
    // usually though it will just be a matter of wrapping a div, and then calling back through to the grid
    return (<div className={this.getClassName()}><Row ref={ node => this.row = node } {...this.props}/></div>);
  }
});

const Example = React.createClass({

  getInitialState() {
    this._columns = [
      { key: 'details',         name: '',           editable: false, width: 40, locked: true, formatter: <DetailsFormatter onClick={this.handleDetailsClick}></DetailsFormatter>},
      { key: 'airbnb_pk',       name: '$airbnb_pk', editable: true, width: 100},
      { key: 'list_user_id',    name: '屋主',       editable: true, width: 80},
      //{ key: 'list_user_last_name',  name: '姓',       editable: true, width: 80},
      { key: 'list_user_first_name', name: '名',       editable: true, width: 80},
///*
      { key: 'wechat',          name: '$wechat',    editable: true, width: 100},
      { key: 'region',          name: '$region',    editable: true, width: 100},
      { key: 'city',            name: '$city',      editable: true, width: 100},
      { key: 'area',            name: '$area',      editable: true, width: 100},
//*/
      { key: 'list_language',         name: '语言',   editable: true, width: 40},
      { key: 'list_native_currency',  name: '货币',   editable: true, width: 50},
      { key: 'list_bedrooms',         name: '卧室',   editable: true, width: 50},
      { key: 'list_beds',             name: '床',     editable: true, width: 50},
      { key: 'list_bathrooms',        name: '浴室',   editable: true, width: 50},
      { key: 'list_min_nights',       name: '最少晚数',   editable: true, width: 80},
      { key: 'list_person_capacity',  name: '可住人数',   editable: true, width: 80},
      { key: 'list_price_formatted',  name: '价格',       editable: true, width: 60},
      { key: 'list_price_for_extra_person_native',  name: '超员费',   editable: true, width: 60},
      { key: 'list_property_type',    name: '房屋类',     editable: true, width: 50},
      { key: 'list_reviews_count',    name: '评价',       editable: true, width: 50},
      { key: 'list_room_type_category',      name: '房间类',     editable: true, width: 50},
      { key: 'list_check_in_time',           name: '入住时间',   editable: true, width: 80},
      { key: 'list_check_in_time_ends_at',   name: '最晚',       editable: true, width: 50},
      { key: 'list_check_out_time',          name: '退房时间',   editable: true, width: 80},
      { key: 'list_guests_included',         name: '标准人数',   editable: true, width: 80},
      { key: 'list_map_image_url',           name: '地图图片',   editable: true, width: 80},
      { key: 'list_cleaning_fee_native',     name: '清洁费',     editable: true, width: 50},
      { key: 'list_security_deposit_native', name: '押金',       editable: true, width: 50},
      { key: 'list_name',             name: '标题',   editable: true, width: 200},
      { key: 'list_address',          name: '地址',   editable: true, width: 200},
      { key: 'list_localized_city',   name: '城市',   editable: true, width: 100},
      { key: 'list_zipcode',          name: '邮编',   editable: true, width: 50},
    ];
    this._columns.forEach((col)=>{
      col.filterable = true;
      col.sortable = true;
    });

    let rows = [];

    return {
      rows: rows,
      selectedIndexes: [],
      loading: false,
      filters: {},
      sortColumn: null,
      sortDirection: null,
      drawerOpen: false
    };
  },

  getRows() {
    return Selectors.getRows(this.state);
  },

  rowGetter(i) {
    const row = this.getRows()[i];
    this._columns.forEach(function(col) {
      row[col.key] = row[col.key] || '';
    });
    if (row.list_user) {
      row.list_user_first_name = row.list_user.user.first_name;
      row.list_user_last_name = row.list_user.user.last_name;
    }
    return row;
  },

  getSize() {
    return this.getRows().length;
  },

  handleDetailsClick() {
    let drawerOpen = true;
    this.setState({ drawerOpen });
  },

  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    let rows = R.clone(this.getRows());

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

    let rows = R.clone(this.getRows());
    rows = R.append(newRow, rows);
    this.setState({ rows });
  },

  handleSave() {
    console.log('save');
    let rows = R.clone(this.getRows());
    axios
      .post('http://' + window.location.hostname + ':8000/host', {data: rows})
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
    console.log('x', this.state.rows.length)
    const data = R.map((index) => {
      var nth = R.nth(index, com.state.rows);
      rows[index].deleted = true;
      console.log('delete', nth.airbnb_pk)
      return nth._id
    })(this.state.selectedIndexes);

    console.log('y', rows.length)
    axios
      .delete('http://' + window.location.hostname + ':8000/host', {data: data})
      .then(function(response) {
        //confirm(com.state.selectedIndexes.length + ' rows deleted');
        console.log('deleted', response.data)
        com.setState({
          selectedIndexes: [],
          rows: rows,
        })
      });
  },

  handleFetch() {
    console.log('fetch');
    this.setState({loading: true});
    if (this.state.selectedIndexes.length === 0) {
      alert('Nothing to be fetched');
      return;
    }
    const com = this;
    let rows = R.clone(this.getRows());
    const data = R.map((index) => {
      var nth = R.nth(index, com.state.rows);
      return R.pick(['_id', 'airbnb_pk'], nth);
    })(this.state.selectedIndexes);

    axios
      .post('http://' + window.location.hostname + ':8000/fetch', {
         data: data
      })
      .then(function(response) {
        console.log('fetched', response.data);
        let rows = com.state.rows;
        response.data.forEach((d) => {
          const index = R.findIndex(R.propEq('_id', d._id))(rows);
          rows = R.update(index, d, rows);
        });
        com.setState({
          selectedIndexes: [],
          rows: rows,
          loading: false,
        })
      });
  },

  onRowsSelected(rows) {
console.log(rows)
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

  handleGridSort(sortColumn, sortDirection) {
    this.setState({ sortColumn: sortColumn, sortDirection: sortDirection });
  },

  onHeaderScroll() {
    console.log(3333333333)
  },

  render() {

    return  (
      <div>
        <div className="spinner">
          <CircularProgress
            style={ this.state.loading ? {} : {display: 'none'}}
            ref={ node => this.spinner = node }
            size={40} thickness={5} />
        </div>
        <div>
          <ReactDataGrid
            ref={ node => this.grid = node }
            enableCellSelect={true}
            columns={this._columns}
            rowGetter={this.rowGetter}
            rowsCount={this.getSize()}
            minHeight={800}
            toolbar={<Toolbar
                onAddRow={this.handleAddRow}
                onSave={this.handleSave}
                onDelete={this.handleDelete}
                onFetch={this.handleFetch}
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
            />
      </div>
      <div>
        <Drawer
          docked={false}
          width={500}
          open={this.state.drawerOpen}
          onRequestChange={(drawerOpen) => this.setState({drawerOpen})}
          openSecondary={true}
        >
        </Drawer>
      </div>
    </div>
    );
  },

  componentWillMount() {
    let com = this;
    axios
      .get('http://' + window.location.hostname + ':8000/host')
      //.get('http://106.14.204.221:8000/host')
      .then(function(response) {
        com.setState({rows: response.data});
      });
  },

  componentDidMount() {
    this.grid.onToggleFilter();
  }
});


class Admin extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <div>
        <div>
          <Example>
          </Example>
        </div>
      </div>
      </MuiThemeProvider>
    )
  }
}

export default Admin;
