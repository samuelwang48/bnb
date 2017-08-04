import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import AppNav from './AppNav';
import UserSearch from './user/search';
import UserBook from './user/book';
import UserRequest from './user/request';
import AdminRequests from './admin/requests';
import AdminHosts from './admin/hosts';
import AdminOrders from './admin/orders';
import Agenda from './admin/agenda';

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
      reservation: null,
      results: [],
    };
  }

  handleReserve = (reservation) => {
    this.setState({reservation});
    this.props.history.push('/user/book/' + reservation._id);
  }

  handleSearch = (cond, results) => {
    console.log('11search results', results)
    this.setState({cond, results});
  }

  componentDidUpdate() {
    console.log(111, this.state);
  }

  render() {
    let _this = this;
    return (
      <div>
        <AppNav {...this.props} />
        <div>
          <Route path="/user/search" render={({ match }) =>
              <UserSearch {...this.state}
                 onSearchResults={this.handleSearch}
                 onReserve={this.handleReserve} />
          } />
          <Route path="/user/book/:id"  render={({ match }) =>
              <UserBook {...this.state} match={match} />
          } />
          <Route path="/user/request" component={UserRequest}/>
          <Route path="/admin/requests" component={AdminRequests}/>
          <Route path="/admin/hosts" component={AdminHosts}/>
          <Route path="/admin/orders" component={AdminOrders}/>
          <Route path="/admin/agenda" component={Agenda}/>
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
