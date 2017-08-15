import React, { Component } from 'react';

const axios = require('axios');
import {
  Col,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'react-bootstrap';

class UserAccount extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dateOpen: false,
      api: 'http://' + window.location.hostname + ':8000',
    };
  };

  handlePoke = () => {
    let data = {
    };
    console.log('poke', data);

    const api = this.state.api;
    axios
      .post(api + '/poke', data, {
        withCredentials: true
      })
      .then(function(response) {
        console.log('poked', response.data)
      });
  };

  render() {
    return (
      <Form horizontal style={{width: '80%', margin: '20px 0'}} action={this.state.api + '/logout'} method="POST">
        <FormGroup>
          <Col componentClass={ControlLabel} xs={2}>
            用户名
          </Col>
          <Col xs={4}>
            <FormControl type="text" name="username" />
          </Col>
        </FormGroup>
   
        <FormGroup>
          <Col componentClass={ControlLabel} xs={2}>
            密码
          </Col>
          <Col xs={4}>
            <FormControl type="password" name="password" />
          </Col>
        </FormGroup>
       
        <FormGroup>
          <Col xsOffset={2} xs={10}>
            <Button type="submit">
              退出账号
            </Button>
          </Col>
        </FormGroup>
   
        <FormGroup>
          <Col xsOffset={2} xs={10}>
            <Button type="button" onClick={this.handlePoke}>
              Poke
            </Button>
          </Col>
        </FormGroup>
      </Form>
    );
  }
}

export default UserAccount;
