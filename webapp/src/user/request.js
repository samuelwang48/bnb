import React, { Component } from 'react';

const axios = require('axios');
import moment from 'moment'
import { DateRange } from 'react-date-range';
import Popover from 'material-ui/Popover';
import {
  InputGroup,
  DropdownButton,
  MenuItem,
  Grid,
  Row,
  Col,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Checkbox,
  Button
} from 'react-bootstrap';

import { geo, getGeo } from '../Geo';
import { RegionEditor } from '../Editors';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

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
    const type = col + 'Id';

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
      .post(api + '/request', {data: data})
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
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <Form horizontal style={{width: '80%', margin: '20px 0'}}>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              委托人微信
            </Col>
            <Col sm={4}>
              <FormControl type="text"
                           inputRef={(input) => { this.wechatBroker = input; }}
                           placeholder="如是住客本人请忽略此字段" />
            </Col>
          </FormGroup>
      
          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              住客微信
            </Col>
            <Col sm={4}>
              <FormControl type="text"
                           inputRef={(input) => { this.wechatGuest = input; }}
                           placeholder="" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              入住日期
            </Col>
            <Col sm={4}>
              <FormControl type="text"
                           inputRef={(input) => { this.startDateEl = input; }}
                           placeholder=""
                           value={this.state.startDateStr}
                           onTouchTap={this.onRangePopoverTap}/>
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              退房日期
            </Col>
            <Col sm={4}>
              <FormControl type="text"
                           inputRef={(input) => { this.endDateEl = input; }}
                           placeholder=""
                           value={this.state.endDateStr}
                           onTouchTap={this.onRangePopoverTap}/>
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

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              目的地城市
            </Col>
            <Col sm={4}>
              <RegionEditor items={this.getCities}
                            col="city"
                            onUpdate={this.handleGeoUpdated}
                            onType={this.handleGeoTyped} />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              目的地区域
            </Col>
            <Col sm={4}>
              <FormControl type="text"
                           inputRef={(input) => { this.area = input; }}
                           placeholder="地标，如：心斋桥" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              人数
            </Col>
            <Col sm={4}>
              <FormControl type="number"
                           style={{width: '60px'}}
                           inputRef={(input) => { this.numberOfGuests = input; }}
                           min="1" placeholder="" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              预算(价格/天)
            </Col>
            <Col sm={4}>
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
            <Col componentClass={ControlLabel} sm={2}>
              备注
            </Col>
            <Col sm={4}>
              <FormControl componentClass="textarea"
                           inputRef={(input) => { this.memo = input; }}
                           placeholder="" />
            </Col>
          </FormGroup>
      
          <FormGroup>
            <Col smOffset={2} sm={10}>
              <Button type="button" onClick={this.handleSubmit}>
                提交
              </Button>
            </Col>
          </FormGroup>
        </Form>
      </MuiThemeProvider>
    );
  }
}

export default UserRequest;
