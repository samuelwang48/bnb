import React, { Component } from 'react';

import moment from 'moment'
import { DateRange } from 'react-date-range';
import Popover from 'material-ui/Popover';
import {Typeahead, AsyncTypeahead} from 'react-bootstrap-typeahead';

import {
  Pagination,
  InputGroup,
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
  Button,
  Thumbnail
} from 'react-bootstrap';

import { geo, getGeo } from '../Geo';
import { RegionEditor } from '../Editors';
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

  _handleSearch = () => {
    this.setState({options: this.cities})
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
                    onSearch={this._handleSearch}
                    labelKey="primaryText"
                    multiple={false}
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
                               placeholder="人数" />
                </Col>
              </FormGroup>
            </Row>
            <Row>
              <FormGroup>
                <Col sm={10}>
                  <Button type="button">
                    <FontAwesome name='rocket' /> 搜索
                  </Button>
                </Col>
              </FormGroup>
            </Row>
          </Paper>
          <div>
            <Thumbnail src="/assets/thumbnaildiv.png" alt="242x200">
              <h3>Thumbnail label</h3>
              <p>Description</p>
              <p>
                <Button bsStyle="primary">Button</Button>&nbsp;
                <Button bsStyle="default">Button</Button>
              </p>
            </Thumbnail>
            <Thumbnail src="/assets/thumbnaildiv.png" alt="242x200">
              <h3>Thumbnail label</h3>
              <p>Description</p>
              <p>
                <Button bsStyle="primary">Button</Button>&nbsp;
                <Button bsStyle="default">Button</Button>
              </p>
            </Thumbnail>
            <Thumbnail src="/assets/thumbnaildiv.png" alt="242x200">
              <h3>Thumbnail label</h3>
              <p>Description</p>
              <p>
                <Button bsStyle="primary">Button</Button>&nbsp;
                <Button bsStyle="default">Button</Button>
              </p>
            </Thumbnail>
            <Thumbnail src="/assets/thumbnaildiv.png" alt="242x200">
              <h3>Thumbnail label</h3>
              <p>Description</p>
              <p>
                <Button bsStyle="primary">Button</Button>&nbsp;
                <Button bsStyle="default">Button</Button>
              </p>
            </Thumbnail>
            <Thumbnail src="/assets/thumbnaildiv.png" alt="242x200">
              <h3>Thumbnail label</h3>
              <p>Description</p>
              <p>
                <Button bsStyle="primary">Button</Button>&nbsp;
                <Button bsStyle="default">Button</Button>
              </p>
            </Thumbnail>
            <Thumbnail src="/assets/thumbnaildiv.png" alt="242x200">
              <h3>Thumbnail label</h3>
              <p>Description</p>
              <p>
                <Button bsStyle="primary">Button</Button>&nbsp;
                <Button bsStyle="default">Button</Button>
              </p>
            </Thumbnail>
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
