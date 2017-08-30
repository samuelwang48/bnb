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
      loginStrategy: '',
    };
  };

  handleNormalLogin() {
    this.setState({loginStrategy: 'local'});
  }

  handleWechatLogin() {
    this.setState({loginStrategy: 'wechat'});
  }

  handlePoke() {
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
          <Form horizontal
                style={{padding: '30px'}}
                action={this.state.api + '/login?strategy=' + this.state.loginStrategy}
                method="POST">
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
                  <Button style={{width: '38%'}} className="pull-left"
                          onMouseDown={this.handleNormalLogin.bind(this)}
                          bsStyle="default"
                          type="submit">
                    登录
                  </Button>
                  <Button style={{width: '58%'}} className="pull-right"
                          onMouseDown={this.handleWechatLogin.bind(this)}
                          bsStyle="success"
                          type="submit">
                    <i className="fa fa-weixin"
                       style={{fontSize: '18px'}}
                       aria-hidden="true"></i> 微信登录
                  </Button>
                </Col>
              </FormGroup>
              <FormGroup>
                <Button style={{width: '25%'}} className="pull-left"
                        type="button" onClick={this.handlePoke.bind(this)}>
                  Poke
                </Button>
              </FormGroup>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}

export default Login;
