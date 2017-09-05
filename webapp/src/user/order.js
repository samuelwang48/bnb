import React, { Component } from 'react';
import moment from 'moment'
const axios = require('axios');
import Divider from 'material-ui/Divider';
import {
  Row,
  Col,
} from 'react-bootstrap';

class UserOrder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      api: 'http://' + window.location.hostname + ':8000',
      orders: []
    };
  };

  render() {
    const _this = this;
    function OrderDivider(props) {
      if (props.index < props.maxlen -1) {
        return (<Divider style={{margin: '10px 0'}} />);
      } else {
        return null;
      }
    }
    function Order(props) {
      const order = props.order;
      return (
        <div>
          <Row>
            <Col xs={3}>目的地</Col>
            <Col xs={3}>入住</Col>
            <Col xs={3}>退房</Col>
            <Col xs={3}>订单状态</Col>
          </Row>
          <Row>
            <Col xs={3}>{order.host.city_translation}</Col>
            <Col xs={3}>{moment(order.startDate).format('YYYY-MM-DD')}</Col>
            <Col xs={3}>{moment(order.endDate).format('YYYY-MM-DD')}</Col>
            <Col xs={3}>{order.inbound}</Col>
          </Row>
          <OrderDivider {...props} />
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
                     order={order}
                     maxlen={_this.state.orders.length} />
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
      .get(api + '/user/order', {
        withCredentials: true
      })
      .then(function(response) {
console.log(response.data)
        _this.setState({orders: response.data});
      })
  }
}

export default UserOrder;
