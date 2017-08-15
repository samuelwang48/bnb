import React, { Component } from 'react';
import moment from 'moment'
require('../../react-data-grid/themes/react-data-grid-toolbar.css');
import { DateRange } from 'react-date-range';
import TextField from 'material-ui/TextField';
import Menu from 'material-ui/Menu';
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Grid,
  Row,
  Col
} from 'react-bootstrap';

class Toolbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dateOpen: false,
      startDateStr: '',
      endDateStr: '',

      enableAddRow: true,
      addRowButtonText: '新建',
      saveButtonText: '保存全部',
      deleteButtonText: '删除选中行',
      fetchButtonText: '获取房源',
      fetchScheduleButtonText: '获取日历',
      currencyButtonText: '汇率',
      filterRowsButtonText: '筛选',
    };
  }

  onAddRow = () => {
    if (this.props.onAddRow !== null && this.props.onAddRow instanceof Function) {
      this.props.onAddRow({newRowIndex: this.props.numberOfRows});
    }
  }

  onSave = () => {
    if (this.props.onSave !== null && this.props.onSave instanceof Function) {
      this.props.onSave();
    }
  }

  onDelete = () => {
    if (this.props.onDelete !== null && this.props.onDelete instanceof Function) {
      this.props.onDelete();
    }
  }

  onFetch = () => {
    if (this.props.onFetch !== null && this.props.onFetch instanceof Function) {
      this.props.onFetch();
    }
  }

  onFetchSchedule = () => {
    if (this.props.onFetchSchedule !== null && this.props.onFetchSchedule instanceof Function) {
      this.props.onFetchSchedule();
    }
  }

  getDefaultProps = () => {
  }

  renderSaveButton = () => {
    if (this.props.onSave ) {
      return (<button type="button" className="btn" onClick={this.onSave}>
        {this.state.saveButtonText}
      </button>);
    }
  }

  renderDeleteButton = () => {
    if (this.props.onDelete ) {
      return (<button type="button" className="btn" onClick={this.onDelete}>
        {this.state.deleteButtonText}
      </button>);
    }
  }

  renderAddRowButton = () => {
    if (this.props.onAddRow ) {
      return (<button type="button" className="btn" onClick={this.onAddRow}>
        {this.state.addRowButtonText}
      </button>);
    }
  }

  renderFetchButton = () => {
    if (this.props.onFetch ) {
      return (<button type="button" className="btn" onClick={this.onFetch}>
        {this.state.fetchButtonText}
      </button>);
    }
  }

  renderFetchScheduleButton = () => {
    if (this.props.onFetchSchedule ) {
      return (<button type="button" className="btn" onClick={this.onFetchSchedule}>
        {this.state.fetchScheduleButtonText}
      </button>);
    }
  }

  onCurrencyUse = (type) => {
    let currency = {
      usd2jpy: parseFloat(this.usd2jpy.value),
      usd2cny: parseFloat(this.usd2cny.value),
    };
    this.props.onCurrencyUse(type, currency);
  }

  onCurrencySave = () => {
    let currency = {
      usd2jpy: parseFloat(this.usd2jpy.value),
      usd2cny: parseFloat(this.usd2cny.value),
    };
    this.props.onCurrencySave(currency);
  }

  componentDidMount = () => {
  }

  renderCurrencyButton = () => {

    return (
      <span>
        <button
          ref={(btn) => { this.currencyButton = btn; }}
          type="button"
          className="btn"
          onTouchTap={this.props.onCurrencyPopoverTap}>
          {this.state.currencyButtonText}
        </button>
        <Menu
          open={this.props.currencyOpen}
          anchorEl={this.currencyButton}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.props.onCurrencyPopoverClose}
        >
          <div style={{padding: 10}}>
            <Row>
              <Col md={12}>
                <Form inline>
                  <FormGroup>
                    <ControlLabel style={{width: 40}}>USD</ControlLabel>
                    {' '}
                    <FormControl type="text"
                                 value={1}
                                 disabled={true}
                                 style={{width: 40}} />
                  </FormGroup>
                  {' : '}
                  <FormGroup>
                    <ControlLabel style={{width: 40}}>USD</ControlLabel>
                    {' '}
                    <FormControl type="text"
                                 disabled={true}
                                 defaultValue={1}
                                 style={{width: 70}} />
                  </FormGroup>
                    {' '}
                  <FormGroup>
                    <Button type="button"
                            onClick={this.onCurrencyUse.bind(this, 'usd')}>
                      Use
                    </Button>
                  </FormGroup>
                </Form>
              </Col>
            </Row>
            <Row style={{marginTop: 5}}>
              <Col md={12}>
                <Form inline>
                  <FormGroup>
                    <ControlLabel style={{width: 40}}>USD</ControlLabel>
                    {' '}
                    <FormControl type="text"
                                 value={1}
                                 style={{width: 40}} />
                  </FormGroup>
                  {' : '}
                  <FormGroup>
                    <ControlLabel style={{width: 40}}>JPY</ControlLabel>
                    {' '}
                    <FormControl type="text"
                                 inputRef={(ref) => { this.usd2jpy = ref; }}
                                 defaultValue={this.props.currency.usd2jpy}
                                 style={{width: 70}} />
                  </FormGroup>
                    {' '}
                  <FormGroup>
                    <Button type="button"
                            onClick={this.onCurrencyUse.bind(this, 'jpy')}>
                      Use
                    </Button>
                  </FormGroup>
                </Form>
              </Col>
            </Row>
            <Row style={{marginTop: 5}}>
              <Col md={12}>
                <Form inline>
                  <FormGroup>
                    <ControlLabel style={{width: 40}}>USD</ControlLabel>
                    {' '}
                    <FormControl type="text"
                                 value={1}
                                 style={{width: 40}} />
                  </FormGroup>
                  {' : '}
                  <FormGroup>
                    <ControlLabel style={{width: 40}}>CNY</ControlLabel>
                    {' '}
                    <FormControl type="text"
                                 inputRef={(ref) => { this.usd2cny = ref; }}
                                 defaultValue={this.props.currency.usd2cny}
                                 style={{width: 70}} />
                  </FormGroup>
                    {' '}
                  <FormGroup>
                    <Button type="button"
                            onClick={this.onCurrencyUse.bind(this, 'cny')}>
                      Use
                    </Button>
                  </FormGroup>
                </Form>
              </Col>
            </Row>
            <Row style={{marginTop: 10}}>
              <Col md={12} style={{textAlign: 'center'}}>
                <Button type="submit"
                        onClick={this.onCurrencySave}>
                  Save
                </Button>
              </Col>
            </Row>
          </div>
        </Menu>
      </span>
    );
  }

  renderToggleFilterButton = () => {
    return (<span></span>)
    /*
    if (this.props.enableFilter) {
      return (<button type="button" className="btn" onClick={this.props.onToggleFilter}>
      {this.state.filterRowsButtonText}
    </button>);
    }
    */
  }

  handleScheduleTouchTap = () => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      dateOpen: true,
      dateOpenAnchorEl: this.startDateEl.input,
    });
  }

  handleScheduleRequestClose = () => {
    this.setState({
      dateOpen: false,
    });
    this.props.onScheduleUpdated(this.state);
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

  renderScheduleButton = () => {
      return (
        <div>
          <TextField
            inputRef={(input) => { this.startDateEl = input; }}
            value={this.state.startDateStr}
            className="date-start"
            placeholder="入住日期"
            style={{width: 120}}
            onTouchTap={this.handleScheduleTouchTap}
          />
          <TextField
            value={this.state.endDateStr}
            className="date-end"
            placeholder="退房日期"
            style={{width: 120}}
            onTouchTap={this.handleScheduleTouchTap}
          />
          <Menu
            open={this.state.dateOpen}
            anchorEl={this.state.dateOpenAnchorEl}
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
                      onClick={this.handleScheduleRequestClose}>选定并显示</button>
            </div>
          </Menu>
        </div>
      );
  }

  render = () => {
    const rowText = this.props.selectedIndexes.length === 1 ? 'row' : 'rows';
    return (
      <div className="react-grid-Toolbar">
        <div className="tools">
          <Grid>
            <Row>
              <Col md={12}>
                {this.renderSaveButton()}
                &nbsp;
                {this.renderAddRowButton()}
                &nbsp;
                {this.renderToggleFilterButton()}
                {this.props.children}
                &nbsp;
                <span>{this.props.selectedIndexes.length}/{this.props.rows.length} {rowText} selected</span>
                &nbsp;
                {this.renderDeleteButton()}
                &nbsp;
                {this.renderFetchButton()}
                &nbsp;
                {this.renderFetchScheduleButton()}
                &nbsp;
                {this.renderCurrencyButton()}
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                {this.renderScheduleButton()}
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
};

module.exports = Toolbar;
