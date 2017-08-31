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
      <Form horizontal style={{padding: '0 30px'}}
            action={this.state.api + '/logout'} method="POST">
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
          <Col className="text-center">
            <Button style={{width: '48%'}} className="pull-left"
                    bsStyle="danger"
                    type="submit">
              退出登录
            </Button>
            <Button style={{width: '48%'}} className="pull-right"
                    type="button" onClick={this.handlePoke}>
              随便逛逛
            </Button>
          </Col>
        </FormGroup>
      </Form>
    );
  }

  componentWillMount() {
    this.props.updateAppTitle('账号设置');
  }
}

export default UserAccount;
