import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import AppNav from './AppNav';
import Login from './Login';
import UserAccount from './user/account';
import UserSearch from './user/search';
import UserBook from './user/book';
import UserRequest from './user/request';
import AdminRequests from './admin/requests';
import AdminHosts from './admin/hosts';
import AdminOrders from './admin/orders';
import Agenda from './admin/agenda';
import AdminUsers from './admin/users';
import 'typeface-roboto'

import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import './index.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './fa/font-awesome-4.7.0/css/font-awesome.min.css';
import "../node_modules/react-image-gallery/styles/css/image-gallery.css";

const axios = require('axios');

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      api: 'http://' + window.location.hostname + ':8000',
      reservation: null,
      results: [],
      pageLoaded: 0,
      appTitle: '',
      user: {
        headimgurl: '',
        nickname: '',
      },
    };
  }

  handleReserve = (reservation) => {
    this.setState({reservation});
    this.props.history.push('/user/book/' + reservation._id);
  }

  handleSearch = (cond, results, pageLoaded) => {
    this.setState({cond, results, pageLoaded});
  }

  updateAppTitle = (appTitle) => {
    this.setState({appTitle});
  }

  componentDidMount() {
    let com = this;
    const api = this.state.api;
    axios
      .get(api + '/user_info', {
        withCredentials: true
      })
      .then(function(response) {
        console.log('app did mount', response.data)
        com.setState({user: response.data});
      });
  }

  render() {
    let _this = this;
    return (
      <div>
        <AppNav {...this.props}
                updateAppTitle={this.updateAppTitle}
                user={this.state.user}
                appTitle={this.state.appTitle} />
        <Route path="/user/search" render={({ match }) =>
            <UserSearch {...this.state}
               onSearchResults={this.handleSearch}
               onReserve={this.handleReserve} />
        } />
        <Route path="/user/book/:id"  render={({ match }) =>
            <UserBook {...this.state} match={match} />
        } />
        <Route path="/user/account" component={UserAccount}/>
        <Route path="/user/request" component={UserRequest}/>
        <Route path="/admin/requests" component={AdminRequests}/>
        <Route path="/admin/hosts" component={AdminHosts}/>
        <Route path="/admin/orders" render={({ match }) =>
            <AdminOrders updateAppTitle={this.updateAppTitle} />
        }/>
        <Route path="/admin/users" component={AdminUsers}/>
        <Route path="/admin/agenda" component={Agenda}/>
      </div>
    )
  }
}

ReactDOM.render((
  <Router>
      <Switch>
        <Route exact path="/" component={Login}/>
        <Route exact path="/login" component={Login}/>
        <Route path="*" component={Home}/>
      </Switch>
  </Router>
  ),
  document.getElementById('root')
);
