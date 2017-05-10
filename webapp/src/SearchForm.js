import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import moment from 'moment'

import {GridList, GridTile} from 'material-ui/GridList';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';

import FontIcon from 'material-ui/FontIcon';

import { DateRange } from 'react-date-range';

import FontAwesome from 'react-fontawesome';

import { Link } from 'react-router-dom';

import geo from '../../geodata';

//console.log(geo);

const getGeo = () => {
  let regions = [];
  let cities = [];
  geo.forEach((g, i) => {
    if (/==/.test(g)) {
      g = g.replace(/[=\[\]]/g, '');
      regions.push(<MenuItem value={i} key={i} primaryText={`${g}`} />);
    }
    else {
      g = g.replace(/\*\[\[/, '')
           .replace(/\]\].*$/, '');
      cities.push(<MenuItem value={i} key={i} primaryText={`${g}`} />);
    }
  })
  regions.splice(0, 0, <MenuItem value={-1} key={-1} primaryText={`全部省份`} />);
  cities.splice(0, 0, <MenuItem value={-1} key={-1} primaryText={`全部城市`} />);

  return {
    regions: regions,
    cities: cities,
  }
}

const person = [];
person.push(<MenuItem value={-1} key={-1} primaryText={`人数`} />);
for (let i = 1; i <= 10; i++ ) {
  person.push(<MenuItem value={i} key={i} primaryText={`${i}人`} />);
}

class SearchForm extends Component {

  constructor(props) {
    super(props);
    const geo = getGeo();

    this.state = {
      region: -1,
      city: -1,
      regions: geo.regions,
      cities: geo.cities,
      person: -1,
      dateOpen: false,
      startDateStr: '',
      endDateStr: '',
    };
  }

  handleRegionChange = (event, index, region) => {
    let cities = [];
    let stop = false;

    if (region === -1) {
      cities = getGeo().cities;
    } else {
      geo.forEach((g, i) => {
        if (i > region && stop === false) {
          if (/==/.test(g)) {
            stop = true;
          } else {
            g = g.replace(/\*\[\[/, '')
                 .replace(/\]\].*$/, '');
            cities.push(<MenuItem value={i} key={i} primaryText={`${g}`} />);
          }
        }
      })
      cities.splice(0, 0, <MenuItem value={-1} key={-1} primaryText={`全部城市`} />);
    }

    this.cityDropdown.setState({
      open: true,
      anchorEl: this.cityDropdown.rootNode,
    });

    this.setState({
      region: region,
      city: -1,
      cities: cities,
    });
  };

  handleCityChange = (event, index, city) => {
    let region;
    let stop = false;

    if (city !== -1) {
      geo.forEach((g, i) => {
        if (/==/.test(g) && stop === false) {
          region = i;
        }
        if ( i >= city ) {
          stop = true;
        }
      });

      this.setState({
        region: region,
        city: city
      });
    } else {
      this.setState({
        city: -1,
      });
    }

  };

  handlePersonChange = (event, index, person) => {
    this.setState({
      person: person,
    });
  };

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      dateOpen: true,
      dateOpenAnchorEl: this.startDateEl.input,
    });
  };

  handleRequestClose = () => {
    this.setState({
      dateOpen: false,
    });
  };

  handleSelect = (range) => {
    if (!range) return;
    this.setState({
      startDate: range.startDate.format('L'),
      endDate: range.endDate.format('L'),
      startDateStr: range.startDate.locale('zh-cn').format('L'),
      endDateStr: range.endDate.locale('zh-cn').format('L'),
    })
  };

  styles = {
    region: {
      padding: 0,
    },
    city: {
      padding: 0,
    },
    area: {
      width: 330,
      margin: '8px 0px'
    },
    person: {
      padding: 0,
    },
    startDate: {
      width: 130,
      margin: '8px 0px'
    },
    endDate: {
      width: 130,
      margin: '8px 0px'
    },
  };

  render() {
    return (
      <div className="search-form">
        <div className="r1">
          <GridList cols={100} cellHeight={50}>
            <GridTile cols={35}>
              <DropDownMenu
                  ref={(input) => { this.regionDropdown = input; }}
                  value={this.state.region}
                  onChange={this.handleRegionChange}
                  openImmediately={false}
                  style={this.styles.region}
              >
                {this.state.regions}
              </DropDownMenu>
            </GridTile>
            <GridTile cols={35}>
              <DropDownMenu
                  ref={(input) => { this.cityDropdown = input; }}
                  value={this.state.city}
                  onChange={this.handleCityChange}
                  openImmediately={false}
                  style={this.styles.city}
              >
                {this.state.cities}
              </DropDownMenu>
            </GridTile>
            <GridTile cols={30}>
              <DropDownMenu
                  value={this.state.person}
                  onChange={this.handlePersonChange}
                  style={this.styles.person}
              >
                {person}
              </DropDownMenu>
            </GridTile>
          </GridList>
        </div>
        <div className="r2">
          <GridList cols={1} cellHeight={50}>
            <GridTile>
              <TextField
                className="area"
                hintText='关键词。如"靠海"、"心斋桥"'
                style={this.styles.area}
              />
            </GridTile>
          </GridList>
        </div>
        <div className="r3">
          <GridList cols={100} cellHeight={80}>
            <GridTile cols={47}>
              <TextField
                ref={(input) => { this.startDateEl = input; }}
                value={this.state.startDateStr}
                className="date-start"
                hintText="入住日期"
                style={this.styles.startDate}
                onTouchTap={this.handleTouchTap}
              />
            </GridTile>
            <GridTile cols={6}>
              <FontAwesome
                className="arrow-right"
                name='long-arrow-right' />
            </GridTile>
            <GridTile cols={47}>
              <TextField
                value={this.state.endDateStr}
                className="date-end"
                hintText="退房日期"
                style={this.styles.endDate}
                onTouchTap={this.handleTouchTap}
              />
              <Popover
                open={this.state.dateOpen}
                anchorEl={this.state.dateOpenAnchorEl}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onRequestClose={this.handleRequestClose}
              >
                <DateRange
                  lang="cn"
                  linkedCalendars={ true }
                  minDate={moment()}
                  //onInit={this.handleSelect}
                  onChange={this.handleSelect}
                />
              </Popover>
            </GridTile>
          </GridList>
        </div>
        <div className="r4">
          <GridList cols={1}>
            <GridTile>
              <Link to={{
                  pathname: '/search/results',
                  search: '?sort=name',
                  hash: '#the-hash',
                  state: { fromDashboard: true }
                }}>
                <RaisedButton
                  label="搜 索"
                  href="https://github.com/callemall/material-ui"
                  target="_blank"
                  icon={
                    <FontAwesome
                      name='magic' />
                  }
                />
              </Link>
            </GridTile>
          </GridList>
        </div>
      </div>
    );
  }
}

export default SearchForm;
