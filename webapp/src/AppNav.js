import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import List, { ListItem, ListItemIcon, ListItemText, ListSubheader } from 'material-ui/List';
import Divider from 'material-ui/Divider';

import Avatar from 'material-ui/Avatar';

import AccountBoxIcon from 'material-ui-icons/AccountBox';
import DraftsIcon from 'material-ui-icons/Drafts';
import MenuIcon from 'material-ui-icons/Menu';
import HotelIcon from 'material-ui-icons/Hotel';
import LocationCityIcon from 'material-ui-icons/LocationCity';
import GroupAddIcon from 'material-ui-icons/GroupAdd';
import CloudDownloadIcon from 'material-ui-icons/CloudDownload';
import FaceIcon from 'material-ui-icons/Face';

import IconButton from 'material-ui/IconButton';

import FontAwesome from 'react-fontawesome';

import {
  Row,
  Col,
  Form,
  Button
} from 'react-bootstrap';

class AppNav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      drawerOpen: false,
      api: 'http://' + window.location.hostname + ':8000',
    };
  }

  onMenuItemSelect = (eventKey) => {
    this.props.history.push(eventKey);
    this.handleDrawerClose();
  }

  handleDrawerClose() {
    this.setState({drawerOpen: false});
  }

  handleDrawerOpen() {
    this.setState({drawerOpen: true});
  }

  render() {
    return (
      <div className="App">
        <Drawer
          open={this.state.drawerOpen}
          onRequestClose={this.handleDrawerClose.bind(this)}
        >
          <Row>
            <Col xs={4}>
              <Avatar style={{margin: '10px 0 0 10px'}}>A</Avatar>
            </Col>
            <Col xs={8}>
              <div style={{margin: '15px 0 0 0'}}>%userName%</div>
              <div style={{margin: '5px 0 0 0'}}>
                <Form horizontal
                      style={{margin: '0'}}
                      action={this.state.api + '/logout'} method="POST">
                  <Button type="submit">
                    退出登录
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
          <div>
          <List>
            <ListItem button onClick={this.onMenuItemSelect.bind(this, '/user/search')}>
              <ListItemIcon>
                <FontAwesome name='rocket' style={{fontSize: '26px'}} />
              </ListItemIcon>
              <ListItemText primary="搜民宿" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <DraftsIcon />
              </ListItemIcon>
              <ListItemText primary="我的订单" />
            </ListItem>
            <ListItem button onClick={this.onMenuItemSelect.bind(this, '/user/account')}>
              <ListItemIcon>
                <AccountBoxIcon />
              </ListItemIcon>
              <ListItemText primary="账号设置" />
            </ListItem>
          </List>
          <Divider />
          <List subheader={<ListSubheader>代理商入口</ListSubheader>}>
            <ListItem button onClick={this.onMenuItemSelect.bind(this, '/user/request')}>
              <ListItemIcon>
                <HotelIcon />
              </ListItemIcon>
              <ListItemText primary="提交民宿需求" />
            </ListItem>
          </List>
          <Divider />
          <List subheader={<ListSubheader>后台管理</ListSubheader>}>
            <ListItem button onClick={this.onMenuItemSelect.bind(this, '/admin/requests')}>
              <ListItemIcon>
                <FaceIcon />
              </ListItemIcon>
              <ListItemText primary="代理需求管理" />
            </ListItem>
            <ListItem button onClick={this.onMenuItemSelect.bind(this, '/admin/orders')}>
              <ListItemIcon>
                <AccountBoxIcon />
              </ListItemIcon>
              <ListItemText primary="订单管理" />
            </ListItem>
            <ListItem button onClick={this.onMenuItemSelect.bind(this, '/admin/hosts')}>
              <ListItemIcon>
                <LocationCityIcon />
              </ListItemIcon>
              <ListItemText primary="房源管理" />
            </ListItem>
            <ListItem button onClick={this.onMenuItemSelect.bind(this, '/admin/users')}>
              <ListItemIcon>
                <GroupAddIcon />
              </ListItemIcon>
              <ListItemText primary="用户管理" />
            </ListItem>
            <ListItem button onClick={this.onMenuItemSelect.bind(this, '/admin/agenda')}>
              <ListItemIcon>
                <CloudDownloadIcon />
              </ListItemIcon>
              <ListItemText primary="同步数据" />
            </ListItem>
          </List>
          </div>
        </Drawer>
        <div className="App-header">
          <IconButton onClick={this.handleDrawerOpen.bind(this)} aria-label="菜单">
            <MenuIcon />
          </IconButton>
          <div className="app-title">{this.props.appTitle || ''}</div>
          <div className="pull-right text-center" style={{margin: '5px'}}>
            <div>日本民宿专业平台</div>
            <div style={{letterSpacing: '1px'}}>CNJPBNB.com</div>
          </div>
        </div>
      </div>
    )
  }
}

export default AppNav;
