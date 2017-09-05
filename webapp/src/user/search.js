import React, { Component } from 'react';

const axios = require('axios');
import moment from 'moment'
import { DateRange } from 'react-date-range';
import StarRatingComponent from '../lib/StarRatingComponent.jsx';
import Menu from 'material-ui/Menu';

import {
  Row,
  Col,
  FormGroup,
  FormControl,
  Button,
} from 'react-bootstrap';

import ImageGallery from 'react-image-gallery';

import FontAwesome from 'react-fontawesome';

var Infinite = require('react-infinite');

class UserSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isInfiniteLoading: false,
      pageLoaded: 0,
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

  onRangePopoverTap = () => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      dateOpen: true,
      dateOpenAnchorEl: this.dateRangeEl,
    });
  };

  handleScheduleRequestClose = (range) => {
    this.handleStopSearch();
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

  handleCityChange = (text) => {
    this.handleStopSearch();
    this.setState({city: this.cityEl.value});
  }

  handleNumberOfGuests = () => {
    this.handleStopSearch();
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

  handleStopSearch() {
    this.setState({
      pageLoaded: 0
    });
  }

  handleStartSearch() {
    this.setState({
      results: [],
      pageLoaded: 0
    }, () => {
      this.handleSearch();
    });
  }

  handleSearch = () => {
    this.setState({isInfiniteLoading: true});

    let _this = this;
    let data = {
      city: this.state.city,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      numberOfGuests: this.state.numberOfGuests,
      page: this.state.pageLoaded
    }

    if (data.page === 0) {
      this.setState({
        results: [],
      });
    }

    const api = this.state.api;
    axios
      .get(api + '/search', {
        params: data,
        withCredentials: true
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
        const results = _this.state.results.concat(hosts);
        _this.setState({
          results: results,
          pageLoaded: ++data.page,
          isInfiniteLoading: false
        })

        _this.props.onSearchResults({
          city: _this.state.city,
          startDate: moment(_this.state.startDate),
          endDate: moment(_this.state.endDate),
          numberOfGuests: _this.state.numberOfGuests
        }, results, _this.state.pageLoaded);
      });
  }

  handleInfiniteLoad() {
    console.log('handle infinite load', this.state.pageLoaded)
    if (this.state.isInfiniteLoading === true) {
      this.setState({ isInfiniteLoading: false });
      return
    }
    if (this.state.pageLoaded === 0) {
      this.setState({ isInfiniteLoading: false });
      return
    }
    this.handleSearch();
  }

  elementInfiniteLoad() {
      return <div className="text-center" style={{padding: '10px'}}>
        数据读取中...
      </div>;
  }

  render() {
    let _this = this;

    return (
      <div>
        <div className="search-form">
          <Row>
            <FormGroup>
              <Col xs={12}>
                <FormControl type="text"
                  inputRef={(input) => { this.cityEl = input; }}
                  value={this.state.city}
                  onChange={this.handleCityChange}
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
                   onMouseUp={this.onRangePopoverTap}
                   placeholder="时间段" />
                <Menu
                  open={this.state.dateOpen}
                  anchorEl={this.state.dateOpenAnchorEl}
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
                            className="btn btn-default"
                            onClick={this.handleScheduleRequestClose}>选定</button>
                  </div>
                </Menu>
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
              <Col xs={12} className="text-center">
                <Button style={{width: '48%', letterSpacing: '5px'}}
                        bsStyle="default"
                        type="button"
                        onClick={this.handleStartSearch.bind(this)}>
                  <FontAwesome name='rocket' style={{fontSize: '18px'}} />搜民宿
                </Button>
              </Col>
            </FormGroup>
          </Row>
        </div>
        <div className="user-search">
          <Infinite containerHeight={463} elementHeight={326}
                    infiniteLoadBeginEdgeOffset={100}
                    onInfiniteLoad={this.handleInfiniteLoad.bind(this)}
                    isInfiniteLoading={this.state.isInfiniteLoading}
                    loadingSpinnerDelegate={this.elementInfiniteLoad()}
                    useWindowAsScrollContainer>
          {
            this.state.results.map(function(host, index){
              return (
                <div key={index} className="search-result">
                  <ImageGallery
                    showThumbnails={false}
                    items={host.images}
                    slideInterval={30000} />
                  <div className="result-details">
                    <Row>
                      <Col xs={6}>
                        {host.list_price_conv}/晚
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
                      <Col xs={8}>
                        {host.list_beds}张床
                        &nbsp;·&nbsp; 
                        可住{host.list_person_capacity}位房客
                      </Col>
                      <Col xs={4}>
                        <Button bsStyle="success" className="pull-right"
                                onClick={_this.handleReserve.bind(_this, host)} >预定</Button>
                      </Col>
                    </Row>
                  </div>
                </div>
              )
            })
          }
          </Infinite>
        </div>
      </div>
    )
  }

  componentDidMount() {
    let cond = this.props.cond;
    if (cond) {
      this.setState({
        startDate: cond.startDate,
        endDate: cond.endDate,
        startDateStr: cond.startDate.locale('zh-cn').format('L'),
        endDateStr: cond.endDate.locale('zh-cn').format('L'),
        city: cond.city || '',
        numberOfGuests: cond.numberOfGuests
      });
      this.numberOfGuests.value = cond.numberOfGuests;
      this.cityEl.value = cond.city;
    }
  }

  componentWillMount() {
    this.props.updateAppTitle('搜民宿');

    let results = this.props.results;
    if (results) {
      this.setState({results});
    }
    let pageLoaded = this.props.pageLoaded;
    if (pageLoaded) {
      this.setState({pageLoaded});
    }

    let com = this;
    const api = this.state.api;

    axios
      .get(api + '/currency', {
        withCredentials: true
      })
      .then(function(response) {
        com.setState({currency: response.data[0]});
      });

    if (this.props.reservation) {
       console.log('cached reservation detected');
    }
  }

}

export default UserSearch;
