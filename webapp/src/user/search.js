import React, { Component } from 'react';

const axios = require('axios');
import moment from 'moment'
import { DateRange } from 'react-date-range';
import Popover from 'material-ui/Popover';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import StarRatingComponent from '../lib/StarRatingComponent.jsx';

import {
  Pagination,
  Row,
  Col,
  FormGroup,
  FormControl,
  Button,
} from 'react-bootstrap';

import ImageGallery from 'react-image-gallery';

import { getGeo } from '../Geo';
import FontAwesome from 'react-fontawesome';
import Paper from 'material-ui/Paper';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

class UserSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      options: [],
      minLength: 1,
      activePage: 1,
      api: 'http://' + window.location.hostname + ':8000',
      results: [],
      currency: {
        usd2jpy: -1,
        usd2cny: -1,
      },
      currentCurrency: 'cny'
    };
  };

  cities = getGeo().cities.map((c) => { return c.props; })

  onRangePopoverTap = () => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      dateOpen: true,
      dateOpenAnchorEl: this.dateRangeEl,
    });
  };

  handlePageSelect = () => {

  }

  handleScheduleRequestClose = (range) => {
    this.setState({
      dateOpen: false,
    });
  };

  handleScheduleSelect = (range) => {
    if (!range) return;
    let state = {
      startDate: range.startDate.format('YYYY-MM-DD'),
      endDate: range.endDate.format('YYYY-MM-DD'),
      startDateStr: range.startDate.locale('zh-cn').format('L'),
      endDateStr: range.endDate.locale('zh-cn').format('L'),
    };
    this.setState(state);
  };

  handleSearchCities = () => {
    this.setState({options: this.cities})
  };

  handleCityChange = (text) => {
    this.setState({city: text});
  }

  handleNumberOfGuests = () => {
    this.setState({numberOfGuests: this.numberOfGuests.value});
  }

  handleReserve = (host) => {
    let reservation = {
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      startDateStr: this.state.startDateStr,
      endDateStr: this.state.endDateStr,
      city: this.state.city,
      numberOfGuests: this.state.numberOfGuests,
      _id: host._id,
    }

    this.props.onReserve(reservation);
  }

  handleSearch = () => {
    let _this = this;
    let data = {
      city: this.state.city,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      numberOfGuests: this.state.numberOfGuests
    }
    console.log(data)
    const api = this.state.api;
    axios
      .get(api + '/search', {
        params: data
      })
      .then(function(response) {
        console.log('search results', response.data)
        var hosts = response.data;
        hosts.map((row) => {
          row.images = row.list_thumbnail_urls.map(function(t) {
            return {
              original: t.replace(/small$/, 'large'),
              thumbnail: t,
            }
          });

          row.images.splice(1, 0, {
              original: row.list_map_image_url,
              thumbnail: row.list_map_image_url,
          });

          if (row.list_native_currency === 'USD') {
            row.list_price_usd                         = Math.round(row.list_price);
            // then calculate other currencies based on currentCurrency
            if (_this.state.currentCurrency === 'usd') {
              // do nothing
              row.list_price_conv                         = '$' + Math.round(row.list_price_usd);
            }
            else if (_this.state.currentCurrency === 'jpy') {
              const usd2jpy = _this.state.currency.usd2jpy;
              row.list_price_conv                         = Math.round(row.list_price_usd * usd2jpy) + '円';
            }
            else if (_this.state.currentCurrency === 'cny') {
              const usd2cny = _this.state.currency.usd2cny;
              row.list_price_conv                         = Math.round(row.list_price_usd * usd2cny) + '元';
            }
          }

          return row;
        })
        _this.setState({results: response.data})
      });
  }

  render() {
    let _this = this;

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div>
          <Paper className="mobile-search-form"
                 zDepth={2} rounded={false}
                 style={{
                   padding: '5px 10px 10px 10px',
                 }}>
            <Row>
              <FormGroup>
                <Col xs={12}>
                  <AsyncTypeahead
                    {...this.state}
                    onSearch={this.handleSearchCities}
                    labelKey="primaryText"
                    multiple={false}
                    onInputChange={this.handleCityChange}
                    placeholder="目的地"
                  />
                </Col>
              </FormGroup>
            </Row>
            <Row>
              <FormGroup>
                <Col xs={12}>
                  <FormControl type="text"
                     inputRef={(input) => { this.dateRangeEl = input; }}
                     value={
                       this.state.startDateStr && this.state.endDateStr
                     ? this.state.startDateStr + ' - ' + this.state.endDateStr
                     : ''
                     }
                     onTouchTap={this.onRangePopoverTap}
                     placeholder="时间段" />
                  <Popover
                    open={this.state.dateOpen}
                    anchorEl={this.state.dateOpenAnchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.handleScheduleRequestClose}
                  >
                    <DateRange
                      lang="cn"
                      linkedCalendars={ true }
                      minDate={moment()}
                      startDate={moment(this.state.startDate)}
                      endDate={moment(this.state.endDate)}
                      //onInit={this.handleSelect}
                      onChange={this.handleScheduleSelect}
                    />
                    <div style={{textAlign: 'center', padding: '0 0 20px 0'}}>
                      <button type="button"
                              className="btn"
                              onClick={this.handleScheduleRequestClose}>选定</button>
                    </div>
                  </Popover>
                </Col>
              </FormGroup>
            </Row>
            <Row>
              <FormGroup>
                <Col xs={12}>
                  <FormControl type="number"
                               min="1"
                               inputRef={(input) => { this.numberOfGuests = input; }}
                               onChange={this.handleNumberOfGuests}
                               placeholder="人数" />
                </Col>
              </FormGroup>
            </Row>
            <Row>
              <FormGroup>
                <Col xs={10}>
                  <Button type="button" onClick={this.handleSearch}>
                    <FontAwesome name='rocket' /> 搜索
                  </Button>
                </Col>
              </FormGroup>
            </Row>
          </Paper>
          <div className="user-search">
            {
              this.state.results.map(function(host, index){
                return (
                  <div key={index}>
                    <ImageGallery
                      showThumbnails={false}
                      items={host.images}
                      slideInterval={30000} />
                    <div className="search-result">
                      <Row>
                        <Col xs={6}>
                          {host.list_price_conv}
                        </Col>
                        <Col xs={6} className="text-right">
                          <StarRatingComponent 
                              name="rate1" 
                              starCount={5}
                              value={host.list_star_rating}
                              renderStarIcon={(index, value) => {
                                return <span className={index <= value ? 'fa fa-star' : 'fa fa-star-o'} />;
                              }}
                              renderStarIconHalf={() => <span className="fa fa-star-half-full" />}
                          />
                          <span className="rating-val">{host.list_star_rating}</span>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={6}>
                          {host.list_beds}张床
                          &nbsp;·&nbsp; 
                          {host.list_person_capacity}位房客
                        </Col>
                        <Col xs={6}>
                          <Button bsStyle="success" className="pull-right"
                                  onClick={_this.handleReserve.bind(_this, host)} >预定</Button>
                        </Col>
                      </Row>
                    </div>
                  </div>
                )
              })
            }
          </div>
          <div className="text-center">
            <Pagination
              prev
              next
              first
              last
              ellipsis
              boundaryLinks
              items={20}
              maxButtons={5}
              activePage={this.state.activePage}
              onSelect={this.handlePageSelect} />
          </div>
        </div>
      </MuiThemeProvider>
    )
  }

  componentWillMount() {
    let com = this;
    const api = this.state.api;

    axios
      .get(api + '/currency')
      .then(function(response) {
        com.setState({currency: response.data[0]});
      });

    if (this.props.reservation) {
       console.log('cached reservation detected')
    }
  }

}

export default UserSearch;
