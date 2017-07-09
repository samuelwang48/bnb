import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import SearchForm from './SearchForm';

class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h4>日本旅游民宿搜索</h4>
          </div>
          <p className="App-intro">
          </p>
          <SearchForm></SearchForm>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
