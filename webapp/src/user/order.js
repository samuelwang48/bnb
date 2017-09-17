import React, { Component } from 'react';
import moment from 'moment'
const axios = require('axios');
import FontAwesome from 'react-fontawesome';
import {
  Row,
  Col,
} from 'react-bootstrap';

import ImageGallery from 'react-image-gallery';
import StarRatingComponent from '../lib/StarRatingComponent.jsx';
import {CardContent} from 'material-ui/Card';

class UserOrder extends Component {
  constructor(props) {
    super(props);

    this.helpers = require('./helpers')(this);

    this.state = {
      api: 'http://' + window.location.hostname + ':8000',
      orders: [],
      currentCurrency: 'cny',
      currency: {
        usd2jpy: -1,
        usd2cny: -1,
      },
    };
  };

  render() {
    const _this = this;

    function Toggler(props) {
      let expanded = props.expanded;

      if (expanded === true) {
        return (
          <Row className="text-center" style={{paddingTop: '10px'}}
               onClick={props.onClick}>
            <FontAwesome name='caret-up' style={{fontSize: '12px'}} /> 收起
          </Row>
        )
      } else {
        return (
          <Row className="text-center" style={{paddingTop: '10px'}}
               onClick={props.onClick}>
            <FontAwesome name='caret-down' style={{fontSize: '12px'}} /> 展开
          </Row>
        )
      }

    }

    function Order(props) {
      const order = props.order;

      const rowNights = _this.helpers.genRowNights(
        order.host.schedule,
        moment(order.startDate),
        moment(order.endDate),
        order.numberOfNights
      );

      const rowCleaning = _this.helpers.genRowCleaning(order.host);
      const rowExtraPersonTotal = _this.helpers.genRowExtraPersonTotal(
        order.host,
        order.numberOfNights
      );

      const rowTotal = _this.helpers.genRowTotal(order.host);

      const handleToggler = () => {
        let orders = _this.state.orders;
        let expanded = orders[props.index].expanded;
        orders[props.index].expanded = !expanded;
        _this.setState({orders});
      }

      return (
        <div>
          <Row className="order-wrap">
            <Col xs={12}>
              <div onClick={handleToggler}>
                <Row className="compact">
                  <Col xs={3}>目的地</Col>
                  <Col xs={3}>入住</Col>
                  <Col xs={3}>退房</Col>
                  <Col xs={3}>订单状态</Col>
                </Row>
                <Row className="compact">
                  <Col xs={3}>{order.host.city_translation}</Col>
                  <Col xs={3}>{moment(order.startDate).format('YYYY-MM-DD')}</Col>
                  <Col xs={3}>{moment(order.endDate).format('YYYY-MM-DD')}</Col>
                  <Col xs={3}><span style={{
                    background: '#000',
                    color: '#fff',
                  }}>{order.inbound}</span></Col>
                </Row>
                <Toggler expanded={order.expanded} />
              </div>
              <Row style={{display: order.expanded === true ? '' : 'none'}}>
                <div className="book-pic">
                  <ImageGallery
                    showThumbnails={false}
                    items={order.host.images}
                    slideInterval={30000} />
                </div>
                <div className="book-head">
                  {order.host.city_translation + ' · ' + order.host.list_beds + '张床'}
                </div>
                <div className="book-rating">
                  <StarRatingComponent 
                      name="rate1" 
                      starCount={5}
                      value={order.host.list_star_rating}
                      renderStarIcon={(index, value) => {
                        return <span className={index <= value ? 'fa fa-star' : 'fa fa-star-o'} />;
                      }}
                      renderStarIconHalf={() => <span className="fa fa-star-half-full" />}
                  />
                </div>
                <CardContent style={{
                  padding: '0 0 10px 0',
                  margin: 0,
                }}>
                  <Row>
                    <Col xs={4}>房客人数 成人</Col>
                    <Col xs={4}>儿童 2 - 12岁</Col>
                    <Col xs={4}>婴幼儿 2岁以下</Col>
                  </Row>
                  <Row>
                    <Col xs={4}>
                      {order.numberOfAdults}
                    </Col>
                    <Col xs={4}>
                      {order.numberOfKids}
                    </Col>
                    <Col xs={4}>
                      {order.numberOfBabies}
                    </Col>
                  </Row>
                  <hr style={{margin: '5px 0'}} />
                  {rowNights}
                  {rowCleaning}
                  {rowExtraPersonTotal}
                  <hr style={{margin: '5px 0'}} />
                  {rowTotal}
                </CardContent>
              </Row>
            </Col>
          </Row>
          <br />
        </div>
      )
    }

    return (
      <div style={{padding: '10px'}}>
        {
          this.state.orders.map(function(order, index){
            return (
              <Order key={index}
                     index={index}
                     order={order} />
            )
          })
        }
      </div>
    );
  }

  componentWillMount() {
    this.props.updateAppTitle('我的订单');
    let _this = this;
    const api = this.state.api;

    axios
      .get(api + '/currency', {
        withCredentials: true
      })
      .then(function(response) {
        _this.setState({currency: response.data[0]});
      })
      .then(function() {

        axios
          .get(api + '/user/order', {
            withCredentials: true
          })
          .then(function(response) {
    console.log(response.data)
            let orders = response.data.map(
              order => {
                let host = order.host;
    
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
    
                order.host = host;
                order.expanded = false;
                order.inbound = {
                  'received': '等待屋主确认',
                  'rejected': '已取消',
                  'approved': '等待支付',
                  'paid'    : '等待入住',
                  'finished': '完成'
                }[order.inbound] || order.inbound;

                return order;
              }
            );
    
            _this.setState({orders: orders});
          })
      })
  }
}

export default UserOrder;
