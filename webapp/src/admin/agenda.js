import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

const axios = require('axios');

import {
  Row,
  Col,
  Button,
  FormControl,
  Form,
} from 'react-bootstrap';

class BnbAgenda extends Component {
  constructor(props) {
    super(props);

    this.state = {
      api: 'http://' + window.location.hostname + ':8000',
      interval: 200,
      ip: '',
    }
  }

  handleAllCalBat() {
    if (!confirm('重建队列将抹去当前所有未完成的队列')) {
      return
    }
    const api = this.state.api;
    axios
      .post(api + '/queue/cal', {data: {}})
      .then(function(response) {
        console.log(response.data);
      });
  }

  handlePurge() {
    if (!confirm('清空队列将抹去当前所有未完成的队列')) {
      return
    }
    const api = this.state.api;
    axios
      .post(api + '/queue/purge', {data: {}})
      .then(function(response) {
        console.log(response.data);
      });
  }

  handleSingleCalBat() {
    let airbnb_pk = this.airbnb_pk.value;
    if (!airbnb_pk) {
      alert('请输入airbnb_pk, 多个之间以逗号隔开');
      return;
    }
    airbnb_pk = airbnb_pk.split(',');
    const api = this.state.api;
    axios
      .post(api + '/queue/cal', {data: {airbnb_pk: airbnb_pk}})
      .then(function(response) {
        console.log(response.data);
      });
  }

  fetchCalendar(airbnb_pk) {
    const d = new Date();
    const airbnb_api = 'https://zh.airbnb.com/api/v2';
    const resource = 'calendar_months';
    let params = {
      listing_id: airbnb_pk,
      key: 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
      currency: 'USD',
      locale: 'en',
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      count: 2,
      _format: 'with_conditions',
    }

    //return new Promise(function(resolve){resolve({data:{}})});

    return axios
      .get(airbnb_api + '/' + resource, {
        params: params,
      });
  }

  handleExecute() {
    const _this = this;
    const api = this.state.api;
    axios
      .post(api + '/queue/jobs', {})
      .then(function(response) {
        let jobs = response.data;
        jobs.forEach((job, index)=>{
          setTimeout(() => {
            console.log('received job', job.id, 'pk', job.airbnb_pk);

            _this.fetchCalendar(job.airbnb_pk)
              .then((response)=>{
                console.log('1 airbnb response', response)
                let schedule = response.data;
                let calendar_months = schedule.calendar_months;
                console.log('1 airbnb response', calendar_months)
                axios
                  .post(api + '/queue/execute', {data: {
                    id: job.id,
                    result: calendar_months,
                    _validity: true,
                  }})
                  .then(function(response) {
                    console.log('executed!', response.data);
                  });
              }, (err)=>{
                console.log('2 airbnb err', err)
                axios
                  .post(api + '/queue/execute', {data: {
                    id: job.id,
                    result: err,
                    _validity: false,
                  }})
                  .then(function(response) {
                    console.log('executed!', response.data);
                  });
              })
          }, index * _this.state.interval);
        })
      });
  }

  handleIntervalChange() {
    this.setState({interval: parseInt(this.intervalRef.value)});
  }

  render() {
    const agenda = 'http://' + window.location.hostname + ':3001';
    return  (
      <div style={{padding: '15px'}}>
        <Row>
          <Col>
            <Form inline>
              客户端IP: {this.state.ip} &nbsp;
              执行频率
              <FormControl type="number"
                           style={{width: 70}}
                           inputRef={(input) => { this.intervalRef = input; }}
                           onChange={this.handleIntervalChange.bind(this)}/>毫秒
            </Form>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form inline>
             <Button onClick={this.handleAllCalBat.bind(this)}>重建排期队列</Button>&nbsp;
             <FormControl type="text"
                          inputRef={(input) => { this.airbnb_pk = input; }}
                          placeholder="airbnb_pk" />&nbsp;
             <Button onClick={this.handleSingleCalBat.bind(this)}>手动排期入队</Button>&nbsp;
             <Button onClick={this.handlePurge.bind(this)}>清空队列</Button>&nbsp;
             <Button onClick={this.handleExecute.bind(this)}>开始执行队列</Button>
            </Form>
          </Col>
        </Row>
        <Row>
          <iframe src={agenda}
                  style={{border: 'none'}}
                  width="100%"
                  height={window.innerHeight - 70}></iframe>
        </Row>
      </div>
    )
  }

  componentWillMount() {
  }

  componentDidMount() {
    const _this = this;
    const api = this.state.api;
    axios
      .post(api + '/ip', {data: {}})
      .then(function(response) {
        console.log('ip', response.data);
        _this.setState({ip: response.data});
      });

    this.intervalRef.value = this.state.interval;
  }

};

class Agenda extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <div>
        <BnbAgenda/>
      </div>
      </MuiThemeProvider>
    )
  }
}

export default Agenda;
