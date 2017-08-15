import React, { Component } from 'react';

const axios = require('axios');
import {
  InputGroup,
  Col,
  Form,
  FormGroup,
  FormControl,
  Button
} from 'react-bootstrap';

class Login extends Component {
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
      <div className="login-page">
        <div className="login-inner">
          <h1 style={{letterSpacing: '7px', fontSize: '25px'}}>日本民宿专业平台</h1>
          <h1>CNJPBNB.com</h1>
          <Form horizontal style={{padding: '30px'}} action={this.state.api + '/login'} method="POST">
            <div className="login-box">
              <FormGroup>
                <InputGroup>
                  <InputGroup.Addon>账户</InputGroup.Addon>
                  <FormControl type="text" name="username" />
                </InputGroup>
              </FormGroup>
    
              <FormGroup>
                <InputGroup>
                  <InputGroup.Addon>密码</InputGroup.Addon>
                  <FormControl type="password" name="password" />
                </InputGroup>
              </FormGroup>
             
              <FormGroup>
                <Col className="text-center" style={{marginTop: '10px'}}>
                  <Button style={{width: '48%'}} className="pull-left"
                          bsStyle="success"
                          type="submit">
                    登录
                  </Button>
                  <Button style={{width: '48%'}} className="pull-right"
                          type="button" onClick={this.handlePoke}>
                    随便逛逛
                  </Button>
                </Col>
              </FormGroup>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}

export default Login;
