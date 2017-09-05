import React, { Component } from 'react';

const axios = require('axios');

import {CardContent} from 'material-ui/Card';

import AddIcon from 'material-ui-icons/AddCircleOutline';
import RemoveIcon from 'material-ui-icons/RemoveCircleOutline';

import StarRatingComponent from '../lib/StarRatingComponent.jsx';
import moment from 'moment'
var R = require('ramda');

import ImageGallery from 'react-image-gallery';

import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';

class UserBook extends Component {
  constructor(props) {
    super(props);

    this.state = {
      api: 'http://' + window.location.hostname + ':8000',
      host: null,
      currentCurrency: 'cny',
      currency: {
        usd2jpy: -1,
        usd2cny: -1,
      },
      reservation: {
        city: "ku",
        endDate: moment("2017-09-06"),
        endDateStr: "2017年9月6日",
        numberOfGuests: "2",
        startDate: moment("2017-09-05"),
        startDateStr: "2017年9月5日",
        //_id: "5916868aff514a0667bff904",
        _id: "591685caff514a0667bff8fc",
      },
      numberOfNights: 0,
      numberOfAdults: 0,
      numberOfKids: 0,
      numberOfBabies: 0,
      rowNights: [],
      rowCleaning: [],
      rowExtraPersonTotal: [],
      rowTotal: [],
      priceNights: 0,
      priceCleaning: 0,
      priceExtraPersonTotal: 0,
      priceTotal: 0
    };

  };

  exchange(obj, currency, from, to) {
    if ((obj[currency] || currency) === 'USD') {
      obj.usd = Math.round(obj[from]);
      // then calculate other currencies based on currentCurrency
      if (this.state.currentCurrency === 'usd') {
        // do nothing
        obj[to] = '$' + Math.round(obj.usd);
      }
      else if (this.state.currentCurrency === 'jpy') {
        const usd2jpy = this.state.currency.usd2jpy;
        obj[to] = Math.round(obj.usd * usd2jpy) + '円';
      }
      else if (this.state.currentCurrency === 'cny') {
        const usd2cny = this.state.currency.usd2cny;
        obj[to] = Math.round(obj.usd * usd2cny) + '元';
      }
      return obj;
    }
  }

  render() {
      if (this.state.host) {
        let host = this.state.host;
        let reservation = this.props.reservation || this.state.reservation;

        return (
          <div>
            <div className="book-pic">
              <ImageGallery
                showThumbnails={false}
                items={host.images}
                slideInterval={30000} />
            </div>
            <div className="book-head">
              {host.list_city + ' · ' + host.list_beds + '张床'}
            </div>
            <div className="book-rating">
              <StarRatingComponent 
                  name="rate1" 
                  starCount={5}
                  value={host.list_star_rating}
                  renderStarIcon={(index, value) => {
                    return <span className={index <= value ? 'fa fa-star' : 'fa fa-star-o'} />;
                  }}
                  renderStarIconHalf={() => <span className="fa fa-star-half-full" />}
              />
            </div>
            <CardContent>
              <Row style={{'marginTop': '-25px'}}>
                <Col xs={4}>入住</Col>
                <Col xs={4}>退房</Col>
                <Col xs={4}>标准人数</Col>
              </Row>
              <Row>
                <Col xs={4}>{reservation.startDateStr}</Col>
                <Col xs={4}>{reservation.endDateStr}</Col>
                <Col xs={4}>{host.list_guests_included}</Col>
              </Row>
              <hr style={{margin: '10px 0'}} />
              <Row>
                <Col xs={6}>房客人数 成人</Col>
                <Col xs={6}>
                  <RemoveIcon onClick={this.handleNumberOfAdults.bind(this, -1)}/>
                  <span style={{
                    'fontSize': '15pt',
                    'margin': '10px',
                    'position': 'relative',
                    'top': '-5px'
                  }}>{this.state.numberOfAdults}</span>
                  <AddIcon onClick={this.handleNumberOfAdults.bind(this, 1)}/>
                </Col>
              </Row>
              <Row>
                <Col xs={6}>儿童 2 - 12岁</Col>
                <Col xs={6}>
                  <RemoveIcon onClick={this.handleNumberOfKids.bind(this, -1)}/>
                  <span style={{
                    'fontSize': '15pt',
                    'margin': '10px',
                    'position': 'relative',
                    'top': '-5px'
                  }}>{this.state.numberOfKids}</span>
                  <AddIcon onClick={this.handleNumberOfKids.bind(this, 1)}/>
                </Col>
              </Row>
              <Row>
                <Col xs={6}>婴幼儿 2岁以下</Col>
                <Col xs={6}>
                  <RemoveIcon onClick={this.handleNumberOfBabies.bind(this, -1)}/>
                  <span style={{
                    'fontSize': '15pt',
                    'margin': '10px',
                    'position': 'relative',
                    'top': '-5px'
                  }}>{this.state.numberOfBabies}</span>
                  <AddIcon onClick={this.handleNumberOfBabies.bind(this, 1)}/>
                </Col>
              </Row>
              <hr style={{margin: '5px 0'}} />
              {this.state.rowNights}
              {this.state.rowCleaning}
              {this.state.rowExtraPersonTotal}
              <hr style={{margin: '5px 0'}} />
              {this.state.rowTotal}
            </CardContent>
            <div className="text-center">
              <Button bsStyle="success"
                      style={{width: '48%'}}
                      onClick={this.handleSubmit.bind(this)}>申请预订</Button>
            </div>
            <br />
            <br />
            <br />
            <br />
            <br />
          </div>
        )
      }
      else {
        return (
          <div></div>
        )
      }
  }

  handleSubmit() {
    let reservation = {
      guestWechat: 'unknown_wechat_id',
      usd2jpy: this.state.currency.usd2jpy,
      usd2cny: this.state.currency.usd2cny,
      host_airbnb_pk: this.state.host.airbnb_pk,
      host_id: this.state.host._id,
      startDate: this.state.reservation.startDate.format('YYYY-MM-DD'),
      endDate: this.state.reservation.endDate.format('YYYY-MM-DD'),
      numberOfNights: this.state.numberOfNights,
      numberOfAdults: this.state.numberOfAdults,
      numberOfKids: this.state.numberOfKids,
      numberOfBabies: this.state.numberOfBabies,
      priceCleaning: this.state.priceCleaning,
      priceExtraPersonTotal: this.state.priceExtraPersonTotal,
      priceNights: this.state.priceNights,
      priceTotal: this.state.priceTotal
    }
    console.log('submit', reservation)

    const api = this.state.api;
    axios
      .post(api + '/book', {data: reservation}, {
        withCredentials: true
      })
      .then(function(response) {
        confirm('预定申请已提交，可在我的订单中查看进度');
        console.log('booked', response.data)
      });
  };

  genRowNights(hostSchedule, startDate, endDate, numberOfNights) {
    // nights
    let priceNights = 0;
    let rowNights = [];
    for (var i = 0; i < numberOfNights; i++) {
        let date = startDate.add(i, 'days');
        let dateStr = date.format('YYYY-MM-DD');
        let schedule = R.find(R.propEq('date', dateStr))(hostSchedule);
        schedule = this.exchange(schedule, 'local_currency', 'local_price', 'local_price_conv');
        rowNights.push(
          <Row key={i}>
            <Col xs={6}>{dateStr}</Col>
            <Col xs={6} className="text-right">
              {schedule.local_price_conv}
            </Col>
          </Row>
        )
        priceNights += parseInt(schedule.local_price, 10);
    }
    this.setState({priceNights: priceNights});
    return rowNights;
  }

  genRowCleaning(host) {
    host = this.exchange(host,
      'list_native_currency', 'list_cleaning_fee_native', 'list_cleaning_fee_native_conv');
    let rowCleaning = [
      <Row key={0}>
        <Col xs={6}>清洁费</Col>
        <Col xs={6} className="text-right">{host.list_cleaning_fee_native_conv}</Col>
      </Row>
    ];
    this.setState({priceCleaning: host.list_cleaning_fee_native});
    return rowCleaning;
  }

  genRowExtraPersonTotal(host, numberOfNights) {
    const totalPerson = parseInt(this.state.numberOfAdults, 10)
                      + parseInt(this.state.numberOfKids, 10);
    const incluedPerson = host.list_guests_included;

    let extraPerson = 0;
    if (totalPerson > incluedPerson) {
      extraPerson = totalPerson - incluedPerson;
    }

    host.extra_person_native_total = host.list_price_for_extra_person_native
      * extraPerson
      * numberOfNights;
    
    host = this.exchange(host,
      'list_native_currency',
      'extra_person_native_total',
      'extra_person_native_total_conv');
    
    host = this.exchange(host,
      'list_native_currency',
      'list_price_for_extra_person_native',
      'list_price_for_extra_person_native_conv');

    let rowExtraPerson = [
      <Row key={0}>
        <Col xs={8}>超员费
          ( {host.list_price_for_extra_person_native_conv}
          &nbsp;x&nbsp;{extraPerson}人
          &nbsp;x&nbsp;{numberOfNights}晚 )
        </Col>
        <Col xs={4} className="text-right">{host.extra_person_native_total_conv}</Col>
      </Row>
    ];
    this.setState({
      priceExtraPersonTotal: host.extra_person_native_total
    });

    return rowExtraPerson;
  }

  genRowTotal() {
    let priceTotal = this.state.priceNights
                   + this.state.priceCleaning
                   + this.state.priceExtraPersonTotal;

    let obj = {priceTotal: priceTotal};

    obj = this.exchange(obj,
      this.state.host.list_native_currency,
      'priceTotal',
      'priceTotalConv');

    this.setState({priceTotal});

    return [
      <Row key={0}>
        <Col xs={6}>总计</Col>
        <Col xs={6} className="text-right">{obj.priceTotalConv}</Col>
      </Row>
    ];
  }

  handleNumberOfAdults(n) {
    let _this = this;
    let numberOfAdults = parseInt(this.state.numberOfAdults, 10) + n;
    if (numberOfAdults <= 0) {
      return
    }
    if ((numberOfAdults + this.state.numberOfKids + this.state.numberOfBabies)
       > this.state.host.list_person_capacity) {
      alert('该民宿最多只能容纳' + this.state.host.list_person_capacity + '位房客')
      return
    }

    this.setState({
      numberOfAdults: numberOfAdults,
    }, function() {
      let rowExtraPersonTotal = this.genRowExtraPersonTotal(
        _this.state.host,
        _this.state.numberOfNights);
  
      _this.setState({
        rowExtraPersonTotal: rowExtraPersonTotal,
      }, () => {
        _this.setState({
          rowTotal: _this.genRowTotal()
        })
      });
    });
  }

  handleNumberOfKids(n) {
    let _this = this;
    let numberOfKids = parseInt(this.state.numberOfKids, 10) + n;
    if (numberOfKids < 0) {
      return
    }
    if ((parseInt(this.state.numberOfAdults, 10) + numberOfKids + parseInt(this.state.numberOfBabies, 10))
       > this.state.host.list_person_capacity) {
      alert('该民宿最多只能容纳' + this.state.host.list_person_capacity + '位房客')
      return
    }

    this.setState({
      numberOfKids: numberOfKids,
    }, function() {
      let rowExtraPersonTotal = this.genRowExtraPersonTotal(
        _this.state.host,
        _this.state.numberOfNights);
  
      _this.setState({
        rowExtraPersonTotal: rowExtraPersonTotal,
      }, () => {
        _this.setState({
          rowTotal: _this.genRowTotal()
        })
      });
    });
  }

  handleNumberOfBabies(n) {
    let _this = this;
    let numberOfBabies = parseInt(this.state.numberOfBabies, 10) + n;
    if (numberOfBabies < 0) {
      return
    }
    if ((parseInt(this.state.numberOfAdults, 10) + parseInt(this.state.numberOfKids, 10) + numberOfBabies)
       > this.state.host.list_person_capacity) {
      alert('该民宿最多只能容纳' + this.state.host.list_person_capacity + '位房客')
      return
    }

    this.setState({
      numberOfBabies: numberOfBabies,
    });
  }

  componentWillMount() {
    this.props.updateAppTitle('预订');
    let _this = this;
    const api = this.state.api;
    let reservation = this.props.reservation || this.state.reservation;
    axios
      .get(api + '/currency', {
        withCredentials: true
      })
      .then(function(response) {
        _this.setState({currency: response.data[0]});
      })
      .then(function() {
    
        axios
          .get(api + '/host/' + _this.props.match.params.id, {
            withCredentials: true
          })
          .then(function(response) {
            let host = response.data;
            console.log(host)
            axios
              .post(api + '/schedule', {
                 data: [{airbnb_pk: host.airbnb_pk,
                        _id: host._id}]
              }, {
                 withCredentials: true
              })
              .then(function(response) {
                console.log('fetched schedule', response.data);
                host.schedule = response.data[0];

                host.images = host.list_thumbnail_urls.map(function(t) {
                  return {
                    original: t.replace(/small$/, 'large'),
                    thumbnail: t,
                  }
                });

                host.images.splice(1, 0, {
                    original: host.list_map_image_url,
                    thumbnail: host.list_map_image_url,
                });
        
                let startDate = moment(reservation.startDate);
                let endDate = moment(reservation.endDate);
                let numberOfNights = endDate.diff(startDate, 'days');
        
        
                let rowNights = _this.genRowNights(host.schedule, startDate, endDate, numberOfNights);
                let rowCleaning = _this.genRowCleaning(host);
                let rowExtraPersonTotal = _this.genRowExtraPersonTotal(host, numberOfNights);
        
                _this.setState({
                  host,
                  numberOfNights,
                  rowNights,
                  rowCleaning,
                  rowExtraPersonTotal,
                }, function() {
                  _this.setState({
                    rowTotal: _this.genRowTotal()
                  })
                });

              });
          });
    });

    this.setState({numberOfAdults: parseInt(reservation.numberOfGuests, 10)});
  }
}
export default UserBook;
