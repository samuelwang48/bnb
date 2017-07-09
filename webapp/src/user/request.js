import React, { Component } from 'react';

import {
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

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

class UserRequest extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <Form horizontal style={{width: '80%', margin: '20px 0'}}>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              委托人微信
            </Col>
            <Col sm={10} md={4}>
              <FormControl type="text" placeholder="如是住客本人请忽略此字段" />
            </Col>
          </FormGroup>
      
          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              住客微信
            </Col>
            <Col sm={10} md={4}>
              <FormControl type="text" placeholder="" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              入住日期
            </Col>
            <Col sm={10} md={4}>
              <FormControl type="text" placeholder="" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              退房日期
            </Col>
            <Col sm={10} md={4}>
              <FormControl type="text" placeholder="" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              目的地城市
            </Col>
            <Col sm={10} md={4}>
              <FormControl type="text" placeholder="" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              目的地区域
            </Col>
            <Col sm={10} md={4}>
              <FormControl type="text" placeholder="地标，如：心斋桥" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              人数
            </Col>
            <Col sm={10} md={4}>
              <FormControl type="text" placeholder="" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              预算
            </Col>
            <Col sm={10} md={4}>
              <FormControl type="text" placeholder="" />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} sm={2}>
              备注
            </Col>
            <Col sm={10} md={4}>
              <FormControl type="text" placeholder="" />
            </Col>
          </FormGroup>
      
          <FormGroup>
            <Col smOffset={2} sm={10}>
              <Button type="submit">
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
