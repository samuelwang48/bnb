import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import AppNav from './AppNav';
import UserRequest from './user/request';
import AdminRequests from './admin/requests';
import AdminHosts from './admin/hosts';

import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import './index.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './fa/font-awesome-4.7.0/css/font-awesome.min.css';
import "../node_modules/react-image-gallery/styles/css/image-gallery.css";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div>
        <AppNav {...this.props}/>
        <div>
          <Route path="/user/request" component={UserRequest}/>
          <Route path="/admin/requests" component={AdminRequests}/>
          <Route path="/admin/hosts" component={AdminHosts}/>
        </div>
      </div>
    )
  }
}

ReactDOM.render((
  <Router>
      <Switch>
        <Route path="*" component={Home}/>
      </Switch>
  </Router>
  ),
  document.getElementById('root')
);
