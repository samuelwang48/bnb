import React, { Component } from 'react';

const axios = require('axios');
import moment from 'moment'
import { DateRange } from 'react-date-range';
import Menu from 'material-ui/Menu';

import {
  InputGroup,
  MenuItem,
  Col,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'react-bootstrap';

import { geo, getGeo } from '../Geo';
import { RegionEditor } from '../Editors';

class UserRequest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dateOpen: false,
      api: 'http://' + window.location.hostname + ':8000',
    };
  };

  onRangePopoverTap = () => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      dateOpen: true,
      dateOpenAnchorEl: this.endDateEl,
    });
  };

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

  handleGeoUpdated = (col, item) => {
    if (col === 'city') {
      this.setState({city: item.title});
    }
  };

  handleGeoTyped = (col, value) => {
    if (col === 'city') {
      this.setState({city: value});
    }
  };

  handleSubmit = () => {
    let data = {
      wechatBroker: this.wechatBroker.value,
      wechatGuest: this.wechatGuest.value,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      city: this.state.city,
      area: this.area.value,
      numberOfGuests: this.numberOfGuests.value,
      budget: this.budget.value,
      memo: this.memo.value
    };
    console.log('save', data);

    const api = this.state.api;
    axios
      .post(api + '/request', {data: data}, {
        withCredentials: true
      })
      .then(function(response) {
        confirm('民宿需求已提交，请等待匹配结果');
        console.log('saved', response.data)
      });
  };

  getCities = () => {
    const region = -1;
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
  };
  

  render() {
    return (
      <div className="broker-request">
        <Form horizontal style={{width: '100%'}}>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={3}>
              委托人微信
            </Col>
            <Col xs={9}>
              <FormControl type="text"
                           inputRef={(input) => { this.wechatBroker = input; }}
                           placeholder="如是住客本人请忽略此字段" />
            </Col>
          </FormGroup>
        
          <FormGroup>
            <Col componentClass={ControlLabel} xs={3}>
              住客微信
            </Col>
            <Col xs={9}>
              <FormControl type="text"
                           inputRef={(input) => { this.wechatGuest = input; }}
                           placeholder="" />
            </Col>
          </FormGroup>
  
          <FormGroup>
            <Col componentClass={ControlLabel} xs={3}>
              入住日期
            </Col>
            <Col xs={9}>
              <FormControl type="text"
                           inputRef={(input) => { this.startDateEl = input; }}
                           placeholder=""
                           value={this.state.startDateStr}
                           onMouseUp={this.onRangePopoverTap}/>
            </Col>
          </FormGroup>
  
          <FormGroup>
            <Col componentClass={ControlLabel} xs={3}>
              退房日期
            </Col>
            <Col xs={9}>
              <FormControl type="text"
                           inputRef={(input) => { this.endDateEl = input; }}
                           placeholder=""
                           value={this.state.endDateStr}
                           onMouseUp={this.onRangePopoverTap}/>
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
  
          <FormGroup>
            <Col componentClass={ControlLabel} xs={3}>
              目的地城市
            </Col>
            <Col xs={9} className="region-editor">
              <RegionEditor items={this.getCities}
                            col="city"
                            onUpdate={this.handleGeoUpdated}
                            onType={this.handleGeoTyped} />
            </Col>
          </FormGroup>
  
          <FormGroup>
            <Col componentClass={ControlLabel} xs={3}>
              目的地区域
            </Col>
            <Col xs={9}>
              <FormControl type="text"
                           inputRef={(input) => { this.area = input; }}
                           placeholder="地标，如：心斋桥" />
            </Col>
          </FormGroup>
  
          <FormGroup>
            <Col componentClass={ControlLabel} xs={3}>
              人数
            </Col>
            <Col xs={9}>
              <FormControl type="number"
                           style={{width: '60px'}}
                           inputRef={(input) => { this.numberOfGuests = input; }}
                           min="1" placeholder="" />
            </Col>
          </FormGroup>
  
          <FormGroup>
            <Col componentClass={ControlLabel} xs={3}>
              预算(价格/天)
            </Col>
            <Col xs={9}>
              <InputGroup
                style={{width: '200px'}}
              >
                <InputGroup.Addon>人民币</InputGroup.Addon>
                <FormControl type="text"
                             inputRef={(input) => { this.budget = input; }}
                             className="text-right" />
                <InputGroup.Addon>.00</InputGroup.Addon>
              </InputGroup>
            </Col>
          </FormGroup>
  
          <FormGroup>
            <Col componentClass={ControlLabel} xs={3}>
              备注
            </Col>
            <Col xs={9}>
              <FormControl componentClass="textarea"
                           inputRef={(input) => { this.memo = input; }}
                           placeholder="" />
            </Col>
          </FormGroup>
        
          <FormGroup>
            <Col xs={12} className="text-center">
              <Button style={{width: '48%'}}
                      onClick={this.handleSubmit}
                      bsStyle="primary"
                      type="button">
                提交需求
              </Button>
            </Col>
          </FormGroup>
          <br />
        </Form>
      </div>
    );
  }

  componentWillMount() {
    this.props.updateAppTitle('提交民宿需求');
  }
}

export default UserRequest;
