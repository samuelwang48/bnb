import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Admin from './Admin';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from 'react-router-dom';

import './index.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './fa/font-awesome-4.7.0/css/font-awesome.min.css';

class Search extends Component {
  render() {
    return (
      <div>
        <h2>Foobar</h2>
        <Route path="/search/results" component={Results}/>
      </div>
    )
  }
}

class Results extends Component {
  render() {
    return (
      <div>
        <h3>Results</h3>
      </div>
    )
  }
}

ReactDOM.render((
  <Router>
      <Switch>
        <Route exact path="/" component={App}/>
        <Route path="/admin" component={Admin}/>
        <Route path="/search" component={Search}/>
      </Switch>
  </Router>
  ),
  document.getElementById('root')
);
