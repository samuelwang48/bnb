import React, { Component } from 'react';

const axios = require('axios');
import moment from 'moment'
import { DateRange } from 'react-date-range';
import Popover from 'material-ui/Popover';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';

import {
  Pagination,
  Row,
  Col,
  FormGroup,
  FormControl,
  Button,
  Thumbnail
} from 'react-bootstrap';

import ImageGallery from 'react-image-gallery';

import { getGeo } from '../Geo';
import FontAwesome from 'react-fontawesome';
import Paper from 'material-ui/Paper';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

class UserSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      options: [],
      minLength: 1,
      activePage: 1,
      api: 'http://' + window.location.hostname + ':8000',
      results: []
    };
  };

  cities = getGeo().cities.map((c) => { return c.props; })

  onRangePopoverTap = () => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      dateOpen: true,
      dateOpenAnchorEl: this.dateRangeEl,
    });
  };

  handlePageSelect = () => {

  }

  handleScheduleRequestClose = (range) => {
    this.setState({
      dateOpen: false,
    });
  };

  handleScheduleSelect = (range) => {
    if (!range) return;
    let state = {
      startDate: range.startDate.format('YYYY-MM-DD'),
      endDate: range.endDate.format('YYYY-MM-DD'),
      startDateStr: range.startDate.locale('zh-cn').format('L'),
      endDateStr: range.endDate.locale('zh-cn').format('L'),
    };
    this.setState(state);
  };

  handleSearchCities = () => {
    this.setState({options: this.cities})
  };

  handleCityChange = (text) => {
    this.setState({city: text});
  }

  handleNumberOfGuests = () => {
    this.setState({numberOfGuests: this.numberOfGuests.value});
  }

  handleSearch = () => {
    let _this = this;
    let data = {
      city: this.state.city,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      numberOfGuests: this.state.numberOfGuests
    }
    console.log(data)
    const api = this.state.api;
    axios
      .get(api + '/search', {
        params: data
      })
      .then(function(response) {
        console.log('search results', response.data)
        var hosts = response.data;
        hosts.map((host) => {
          host.images = host.list_thumbnail_urls.map(function(t) {
            return {
              original: t.replace(/small$/, 'large'),
              thumbnail: t,
            }
          });
          return host;
        })
        _this.setState({results: response.data})
      });
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div>
          <Paper zDepth={2} rounded={false}
                 style={{
                   padding: '10px',
                 }}>
            <Row>
              <FormGroup>
                <Col sm={12}>
                  <AsyncTypeahead
                    {...this.state}
                    onSearch={this.handleSearchCities}
                    labelKey="primaryText"
                    multiple={false}
                    onInputChange={this.handleCityChange}
                    placeholder="目的地"
                  />
                </Col>
              </FormGroup>
            </Row>
            <Row>
              <FormGroup>
                <Col sm={12}>
                  <FormControl type="text"
                     inputRef={(input) => { this.dateRangeEl = input; }}
                     value={
                       this.state.startDateStr && this.state.endDateStr
                     ? this.state.startDateStr + ' - ' + this.state.endDateStr
                     : ''
                     }
                     onTouchTap={this.onRangePopoverTap}
                     placeholder="时间段" />
                  <Popover
                    open={this.state.dateOpen}
                    anchorEl={this.state.dateOpenAnchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.handleScheduleRequestClose}
                  >
                    <DateRange
                      lang="cn"
                      linkedCalendars={ true }
                      minDate={moment()}
                      startDate={moment(this.state.startDate)}
                      endDate={moment(this.state.endDate)}
                      //onInit={this.handleSelect}
                      onChange={this.handleScheduleSelect}
                    />
                    <div style={{textAlign: 'center', padding: '0 0 20px 0'}}>
                      <button type="button"
                              className="btn"
                              onClick={this.handleScheduleRequestClose}>选定</button>
                    </div>
                  </Popover>
                </Col>
              </FormGroup>
            </Row>
            <Row>
              <FormGroup>
                <Col sm={12}>
                  <FormControl type="number"
                               min="1"
                               inputRef={(input) => { this.numberOfGuests = input; }}
                               onChange={this.handleNumberOfGuests}
                               placeholder="人数" />
                </Col>
              </FormGroup>
            </Row>
            <Row>
              <FormGroup>
                <Col sm={10}>
                  <Button type="button" onClick={this.handleSearch}>
                    <FontAwesome name='rocket' /> 搜索
                  </Button>
                </Col>
              </FormGroup>
            </Row>
          </Paper>
          <div>
            {
              this.state.results.map(function(host, index){
                return (
                  <div key={index}>
                    <h5>{host.airbnb_pk}</h5>
                    <ImageGallery
                      showThumbnails={false}
                      items={host.images}
                      slideInterval={30000} />
                  </div>
                )
              })
            }
          </div>
          <div className="text-center">
            <Pagination
              prev
              next
              first
              last
              ellipsis
              boundaryLinks
              items={20}
              maxButtons={5}
              activePage={this.state.activePage}
              onSelect={this.handlePageSelect} />
          </div>
        </div>
      </MuiThemeProvider>
    )
  }

}

export default UserSearch;
