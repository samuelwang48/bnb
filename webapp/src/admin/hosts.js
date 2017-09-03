import React, { Component } from 'react';
import moment from 'moment'

import Dotdotdot from 'react-dotdotdot'

import Drawer from 'material-ui/Drawer';
import { MenuItem } from 'material-ui/Menu';

import R from 'ramda';

const axios = require('axios');

const ReactDataGrid = require('../../react-data-grid/packages/react-data-grid/dist/react-data-grid');
const Toolbar = require('../react-data-grid-override/GridToolbarHosts');
import Selectors from '../react-data-grid-override/Selectors';

import { geo, getGeo } from '../Geo';
import { RegionEditor } from '../Editors';

import {Grid, Row, Col} from 'react-bootstrap';
import ImageGallery from 'react-image-gallery';

let globalState = null;

const CalFormatter = React.createClass({
  render() {
    if(!!globalState === false ||
       !!this.props.value === false ||
       !!globalState.scheduleEndDate === false ||
       !!globalState.scheduleStartDate === false ) return(<span></span>);
    let availability = this.props.value;
    let dates = availability.map(function(avail, i) {
      if (avail.date) {
        return  (
           <span className="cal-date"
                 style={{ background: avail.available ? '#3cdc00' : '#ccc'}}
                 key={i}
           >{avail.date.replace(/.*\-(\d+)/, "$1")}</span>
        )
      } else {
        return null;
      }
    });

    return (
      <div>
        {dates}
      </div>
    )
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
        <i className="fa fa-pencil"></i>
      </div>
    )
  }
});

const StarFormatter = React.createClass({
  render() {
    return (
      <div>{this.props.value}</div>
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
    const Row = ReactDataGrid.Row;
    // here we are just changing the style
    // but we could replace this with anything we liked, cards, images, etc
    // usually though it will just be a matter of wrapping a div, and then calling back through to the grid
    return (<div className={this.getClassName()}><Row ref={ node => this.row = node } {...this.props}/></div>);
  }
});

const GridAdminHosts = React.createClass({

  getInitialState() {
    this._columns = [
      { key: 'details',         name: '',           editable: false, width: 40, locked: true, formatter: <DetailsFormatter onClick={this.handleDetailsClick} {...this.props} {...this.state}/>},
      { key: 'list_star_rating',name: '星级',       editable: true, width: 40,  formatter: <StarFormatter { ...this.props }/>},
      { key: 'availability',    name: '可住日期',   editable: false, formatter: <CalFormatter {...this.props}/>},
      { key: 'tf',              name: '日历同步',   editable: false, width: 70},
      { key: 'hf',              name: '房源同步',   editable: false, width: 70},
      { key: 'airbnb_pk',       name: '$airbnb_pk', editable: true, width: 100},
      { key: 'local_id',        name: '编号',       editable: true, width: 100},
      { key: 'list_user_first_name', name: '名',    editable: true, width: 80},
      { key: 'wechat',          name: '$wechat',    editable: true, width: 100},
      { key: 'region',          name: '$region',    editable: true, width: 100, editor: <RegionEditor items={this.getRegions} col="region" onUpdate={this.handleGeoUpdated} />},
      { key: 'city',            name: '$city',      editable: true, width: 100, editor: <RegionEditor items={this.getCities} col="city" onUpdate={this.handleGeoUpdated} />},
      { key: 'area',            name: '$area',      editable: true, width: 100},
      { key: 'list_city',       name: '抓取地址',   editable: true, width: 100},
      { key: 'list_bedrooms',         name: '卧室',   editable: true, width: 50},
      { key: 'list_beds',             name: '床',     editable: true, width: 50},
      { key: 'list_bathrooms',        name: '浴室',   editable: true, width: 50},
      { key: 'list_min_nights',       name: '最少晚数',   editable: true, width: 80},
      { key: 'list_person_capacity',  name: '可住人数',   editable: true, width: 80},
      { key: 'list_price_conv',       name: '价格',       editable: true, width: 70},
      { key: 'list_price_conv_for_extra_person_native', name: '超员费',   editable: true, width: 70},
      { key: 'list_conv_cleaning_fee_native',           name: '清洁费',   editable: true, width: 70},
      { key: 'list_conv_security_deposit_native',       name: '押金',     editable: true, width: 70},
      { key: 'list_property_type',    name: '房屋类',     editable: true, width: 50},
      { key: 'list_reviews_count',    name: '评价',       editable: true, width: 50},
      { key: 'list_room_type_category',      name: '房间类',     editable: true, width: 50},
      { key: 'list_check_in_time',           name: '入住时间',   editable: true, width: 80},
      { key: 'list_check_in_time_ends_at',   name: '最晚',       editable: true, width: 50},
      { key: 'list_check_out_time',          name: '退房时间',   editable: true, width: 80},
      { key: 'list_guests_included',         name: '标准人数',   editable: true, width: 80},
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
      drawerOpen: false,
      current: {
        images: [],
        regionId: -1,
        cityId: -1,
      },
      currencyPopoverOpen: false,
      currency: {
        usd2jpy: -1,
        usd2cny: -1,
      },
      currentCurrency: 'usd',
      scheduleStartDate: null,
      scheduleEndDate: null,
    };
  },

  handleGeoUpdated(col, item) {
    const type = col + 'Id';
    let current = this.state.current;
        current[type] = item.id;

    if (col === 'city') {
      let region;
      let stop = false;
      const city = item.id;
      if (city !== -1) {
        geo.forEach((g, i) => {
          if (/==/.test(g) && stop === false) {
            region = i;
          }
          if ( i >= city ) {
            stop = true;
          }
        });
        region = geo[region].replace(/[=\[\]]/g, '');
      } else {
        region = '全部省份';
      }
      current.region = region;
      this.setState({current});
    }
  },

  getRegions() {
    return getGeo().regions.map(function(g){
      return {
        id: g.props.value,
        title: g.props.primaryText
      }
    })
  },

  getCities() {
    const region = typeof this.state.current.regionId === 'undefined'
                 ? -1 : this.state.current.regionId;
    let cities = [];
    let stop = false;

    if (region === -1) {
      cities = getGeo().cities;
    } else {
      geo.forEach((g, i) => {
        if (i > region && stop === false) {
          if (/==/.test(g)) {
            stop = true;
          } else {
            g = g.replace(/\*\[\[/, '')
                 .replace(/\]\].*$/, '');
            cities.push(<MenuItem value={i} key={i} primaryText={`${g}`} />);
          }
        }
      })
      cities.splice(0, 0, <MenuItem value={-1} key={-1} primaryText={`全部城市`} />);
    }
    return cities.map(function(g){
      return {
        id: g.props.value,
        title: g.props.primaryText
      }
    })
  },

  getRows() {
    return Selectors.getRows(this.state);
  },

  rowGetter(i) {
    const row = this.getRows()[i];
    if (!row) return;
    this._columns.forEach(function(col) {
      row[col.key] = row[col.key] || '';
    });
    if (row.list_primary_host) {
      row.list_user_first_name = row.list_primary_host.first_name;
      row.list_user_last_name = row.list_primary_host.last_name;
    }
    if (row.list_check_out_time) {
      if (/:/.test(row.list_check_out_time) === false) {
         row.list_check_out_time += ':00';
      }
    }
    // first convert to usd
    if (row.list_native_currency === 'USD') {
      row.list_price_usd                         = Math.round(row.list_price);
      row.list_price_usd_for_extra_person_native = Math.round(row.list_price_for_extra_person_native);
      row.list_usd_cleaning_fee_native           = Math.round(row.list_cleaning_fee_native);
      row.list_usd_security_deposit_native       = row.list_security_deposit_native ? Math.round(row.list_security_deposit_native) : 0;
      // then calculate other currencies based on currentCurrency
      if (this.state.currentCurrency === 'usd') {
        // do nothing
        row.list_price_conv                         = '$' + Math.round(row.list_price_usd);
        row.list_price_conv_for_extra_person_native = '$' + Math.round(row.list_price_usd_for_extra_person_native);
        row.list_conv_cleaning_fee_native           = '$' + Math.round(row.list_usd_cleaning_fee_native);
        row.list_conv_security_deposit_native       = row.list_usd_security_deposit_native ? '$' + Math.round(row.list_usd_security_deposit_native) : '-';
      }
      else if (this.state.currentCurrency === 'jpy') {
        const usd2jpy = this.state.currency.usd2jpy;
        row.list_price_conv                         = Math.round(row.list_price_usd * usd2jpy) + '円';
        row.list_price_conv_for_extra_person_native = Math.round(row.list_price_usd_for_extra_person_native * usd2jpy) + '円';
        row.list_conv_cleaning_fee_native           = Math.round(row.list_usd_cleaning_fee_native * usd2jpy) + '円';
        row.list_conv_security_deposit_native       = row.list_usd_security_deposit_native ? Math.round(row.list_usd_security_deposit_native * usd2jpy) + '円' : '-';
      }
      else if (this.state.currentCurrency === 'cny') {
        const usd2cny = this.state.currency.usd2cny;
        row.list_price_conv                         = Math.round(row.list_price_usd * usd2cny) + '元';
        row.list_price_conv_for_extra_person_native = Math.round(row.list_price_usd_for_extra_person_native * usd2cny) + '元';
        row.list_conv_cleaning_fee_native           = Math.round(row.list_usd_cleaning_fee_native * usd2cny) + '元';
        row.list_conv_security_deposit_native       = row.list_usd_security_deposit_native ? Math.round(row.list_usd_security_deposit_native * usd2cny) + '元' : '-';
      }
    }

    return row;
  },

  getSize() {
    return this.getRows().length;
  },

  handleDetailsClick(r) {
    const i = r.props.rowIdx;
    const current = this.getRows()[i];
    if (!current) return;
    if (!current.list_thumbnail_urls) {
      alert('Please fetch details first!');
      this.setState({current: null});
    } else {
      current.images = current.list_thumbnail_urls.map(function(t) {
        return {
          original: t.replace(/small$/, 'large'),
          thumbnail: t,
        }
      });
      current.images.splice(0, 0, {
          original: current.list_map_image_url,
          thumbnail: current.list_map_image_url,
      });
      current.rowIdx = i;
      const drawerOpen = true;
console.log(123, current)
      this.setState({ current, drawerOpen });
    }
  },

  handleRowClick(i) {
    //const row = this.getRows()[i];
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
    const api = this.state.api;
    axios
      .post(api + '/host', {data: rows}, {
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
      .delete(api + '/host', {data: data}, {
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

  handleFetch() {
    console.log('fetch');
    this.setState({loading: true});
    if (this.state.selectedIndexes.length === 0) {
      alert('Nothing to be fetched');
      return;
    }
    const com = this;
    const data = R.map((index) => {
      var nth = R.nth(index, com.getRows());
      return R.pick(['_id', 'airbnb_pk'], nth);
    })(this.state.selectedIndexes);

    const api = this.state.api;
    axios
      .post(api + '/fetch', {
         data: data
      }, {
        withCredentials: true
      })
      .then(function(response) {
        console.log('fetched', response.data);
        let rows = com.getRows();
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

  handleFetchSchedule() {
    console.log('fetch schedule');
    this.setState({loading: true});
    if (this.state.selectedIndexes.length === 0) {
      alert('Nothing to be fetched');
      return;
    }
    const com = this;
    const data = R.map((index) => {
      var nth = R.nth(index, com.getRows());
      return R.pick(['_id', 'airbnb_pk'], nth);
    })(this.state.selectedIndexes);
console.log('fetch schedule', data)
    const api = this.state.api;
    axios
      .post(api + '/schedule', {
         data: data
      }, {
        withCredentials: true
      })
      .then(function(response) {
        console.log('fetched', response.data);
/*
        let rows = com.getRows();
        response.data.forEach((d) => {
          const index = R.findIndex(R.propEq('_id', d._id))(rows);
          rows = R.update(index, d, rows);
        });
        com.setState({
          selectedIndexes: [],
          rows: rows,
          loading: false,
        })
*/
        com.setState({
          loading: false,
        })
      });
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

  handleGridSort(sortColumn, sortDirection) {
    this.setState({ sortColumn: sortColumn, sortDirection: sortDirection });
  },

  handleCurrencyTap() {
    this.setState({ currencyPopoverOpen: true });
  },

  handleCurrencyClose() {
    this.setState({ currencyPopoverOpen: false });
  },

  handleCurrencyUse(type, currency) {
    this.setState({ currencyPopoverOpen: false, currency: currency,
                    currentCurrency: type});
    this.handleGridRowsUpdated({});
  },

  handleCurrencySave(currency) {
    this.setState({ currencyPopoverOpen: false, currency: currency });
    
    const api = this.state.api;
    axios
      .post(api + '/currency', {data: {currency}}, {
        withCredentials: true
      })
      .then(function(response) {
        confirm('currency exchange rates saved');
        console.log('currency exchange rates saved', response.data)
      });
  },

  handleScheduleUpdated(range) {
    let state = {
      scheduleStartDate: moment(range.startDate),
      scheduleEndDate: moment(range.endDate),
      loading: true
    };
    this.setState(state);
    globalState = state;
    //this.handleGridRowsUpdated({});

    let com = this;
    const api = this.state.api;
    axios
      .get(api + '/filter', {
        params: {
          scheduleStartDate: range.startDate,
          scheduleEndDate: range.endDate,
        },
        withCredentials: true
      })
      //.get('http://106.14.204.221:8000/host')
      .then(function(response) {
         com.setState({rows: response.data,
                       loading: false});
      });
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
            minHeight={window.innerHeight - 100}
            rowHeight={25}
            toolbar={<Toolbar
                onAddRow={this.handleAddRow}
                onSave={this.handleSave}
                onDelete={this.handleDelete}
                onFetch={this.handleFetch}
                onFetchSchedule={this.handleFetchSchedule}
                selectedIndexes={this.state.selectedIndexes}
                rows={this.state.rows}
                enableFilter={true}
                currencyOpen={this.state.currencyPopoverOpen}
                onCurrencyPopoverClose={this.handleCurrencyClose}
                onCurrencyPopoverTap={this.handleCurrencyTap}
                currency={this.state.currency}
                onCurrencyUse={this.handleCurrencyUse}
                onCurrencySave={this.handleCurrencySave}
                onScheduleUpdated={this.handleScheduleUpdated}
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
      <div>
        <Drawer
          docked={false}
          width={500}
          open={this.state.drawerOpen}
          onRequestChange={(drawerOpen) => this.setState({drawerOpen})}
          openSecondary={true}
        >
          <div>
            <ImageGallery
              items={this.state.current ? this.state.current.images : []}
              slideInterval={2000}/>
          </div>
          <Grid style={{width: 500}} className="details">
            <Row>
              <Col xs={3}>
                Airbnb编号
              </Col>
              <Col xs={9}>
                <a href={'https://zh.airbnb.com/rooms/' + this.state.current.airbnb_pk} target="_blank">
                  {this.state.current.airbnb_pk}
                </a>
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                名称
              </Col>
              <Col xs={9}>
                {this.state.current.list_name}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                省
              </Col>
              <Col xs={9}>
                {this.state.current.region}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                市
              </Col>
              <Col xs={9}>
                {this.state.current.city}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                地址
              </Col>
              <Col xs={9}>
                {this.state.current.list_address}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                卧室
              </Col>
              <Col xs={9}>
                {this.state.current.list_bedrooms}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                床数
              </Col>
              <Col xs={9}>
                {this.state.current.list_beds}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                浴室
              </Col>
              <Col xs={9}>
                {this.state.current.list_bathrooms}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                入住时间开始
              </Col>
              <Col xs={9}>
                {this.state.current.list_check_in_time_start}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                入住时间结束
              </Col>
              <Col xs={9}>
                {this.state.current.list_check_in_time_end}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                最晚退房时间
              </Col>
              <Col xs={9}>
                {this.state.current.list_check_out_time}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                起住天数
              </Col>
              <Col xs={9}>
                {this.state.current.list_min_nights}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                价格
              </Col>
              <Col xs={9}>
                {this.state.current.list_price_conv}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                清洁费
              </Col>
              <Col xs={9}>
                {this.state.current.list_conv_cleaning_fee_native}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                押金
              </Col>
              <Col xs={9}>
                {this.state.current.list_conv_security_deposit_native}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                价格包含人数
              </Col>
              <Col xs={9}>
                {this.state.current.list_guests_included}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                可住人数
              </Col>
              <Col xs={9}>
                {this.state.current.list_person_capacity}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                增员费
              </Col>
              <Col xs={9}>
                {this.state.current.list_price_conv_for_extra_person_native}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                便利设施
              </Col>
              <Col xs={9}>
                {this.state.current.list_amenities}
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                社区介绍
              </Col>
              <Col xs={9}>
                <Dotdotdot clamp={3}>
                  {this.state.current.list_neighborhood_overview}
                </Dotdotdot>
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                房屋简介
              </Col>
              <Col xs={9}>
                <Dotdotdot clamp={3}>
                  {this.state.current.list_description}
                </Dotdotdot>
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                使用权限
              </Col>
              <Col xs={9}>
                <Dotdotdot clamp={3}>
                  {this.state.current.list_access}
                </Dotdotdot>
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                使用守则
              </Col>
              <Col xs={9}>
                <Dotdotdot clamp={3}>
                  {this.state.current.list_house_rules}
                </Dotdotdot>
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                屋主互动
              </Col>
              <Col xs={9}>
                <Dotdotdot clamp={3}>
                  {this.state.current.list_interaction}
                </Dotdotdot>
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                屋主备注
              </Col>
              <Col xs={9}>
                <Dotdotdot clamp={3}>
                  {this.state.current.list_notes}
                </Dotdotdot>
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                
              </Col>
              <Col xs={9}>
              </Col>
            </Row>
          </Grid>
        </Drawer>
      </div>
    </div>
    );
  },

  componentWillMount() {
    let com = this;
    const api = this.state.api;
    axios
      .get(api + '/host', {
        withCredentials: true
      })
      //.get('http://106.14.204.221:8000/host')
      .then(function(response) {
        com.setState({rows: response.data});
      });

    axios
      .get(api + '/currency', {
        withCredentials: true
      })
      .then(function(response) {
        com.setState({currency: response.data[0]});
      });
  },

  componentDidMount() {
    this.grid.onToggleFilter();
  }
});


class AdminHosts extends Component {
  render() {
    return (
      <div>
        <GridAdminHosts/>
      </div>
    )
  }

  componentWillMount() {
    this.props.updateAppTitle('房源管理');
  }
}

export default AdminHosts;
