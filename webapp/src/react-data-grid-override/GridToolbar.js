const React = require('react');
require('../../react-data-grid/themes/react-data-grid-toolbar.css');
import Popover from 'material-ui/Popover';
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Row,
  Col
} from 'react-bootstrap';

const Toolbar = React.createClass({
  propTypes: {
    onAddRow: React.PropTypes.func,
    onToggleFilter: React.PropTypes.func,
    enableFilter: React.PropTypes.bool,
    numberOfRows: React.PropTypes.number,
    addRowButtonText: React.PropTypes.string,
    filterRowsButtonText: React.PropTypes.string,
    children: React.PropTypes.any
  },

  onAddRow() {
    if (this.props.onAddRow !== null && this.props.onAddRow instanceof Function) {
      this.props.onAddRow({newRowIndex: this.props.numberOfRows});
    }
  },

  onSave() {
    if (this.props.onSave !== null && this.props.onSave instanceof Function) {
      this.props.onSave();
    }
  },

  onDelete() {
    if (this.props.onDelete !== null && this.props.onDelete instanceof Function) {
      this.props.onDelete();
    }
  },

  onFetch() {
    if (this.props.onFetch !== null && this.props.onFetch instanceof Function) {
      this.props.onFetch();
    }
  },

  getDefaultProps() {
    return {
      enableAddRow: true,
      addRowButtonText: 'Add Row',
      saveButtonText: 'Save All',
      deleteButtonText: 'Delete selected rows',
      fetchButtonText: 'Fetch selected',
      currencyButtonText: 'Currency Exchange Rate',
      filterRowsButtonText: 'Filter Rows',
    };
  },

  renderSaveButton() {
    if (this.props.onSave ) {
      return (<button type="button" className="btn" onClick={this.onSave}>
        {this.props.saveButtonText}
      </button>);
    }
  },

  renderDeleteButton() {
    if (this.props.onDelete ) {
      return (<button type="button" className="btn" onClick={this.onDelete}>
        {this.props.deleteButtonText}
      </button>);
    }
  },

  renderAddRowButton() {
    if (this.props.onAddRow ) {
      return (<button type="button" className="btn" onClick={this.onAddRow}>
        {this.props.addRowButtonText}
      </button>);
    }
  },

  renderFetchButton() {
    if (this.props.onFetch ) {
      return (<button type="button" className="btn" onClick={this.onFetch}>
        {this.props.fetchButtonText}
      </button>);
    }
  },

  onCurrencyUse(type) {
    let currency = {
      usd2jpy: parseFloat(this.usd2jpy.value),
      usd2cny: parseFloat(this.usd2cny.value),
    };
    this.props.onCurrencyUse(type, currency);
  },

  onCurrencySave() {
    let currency = {
      usd2jpy: parseFloat(this.usd2jpy.value),
      usd2cny: parseFloat(this.usd2cny.value),
    };
    this.props.onCurrencySave(currency);
  },

  componentDidMount() {
  },

  renderCurrencyButton() {

    return (
      <span>
        <button
          ref={(btn) => { this.currencyButton = btn; }}
          type="button"
          className="btn"
          onTouchTap={this.props.onCurrencyPopoverTap}>
          {this.props.currencyButtonText}
        </button>
        <Popover
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
        </Popover>
      </span>
    );
  },

  renderToggleFilterButton() {
    if (this.props.enableFilter) {
      return (<button type="button" className="btn" onClick={this.props.onToggleFilter}>
      {this.props.filterRowsButtonText}
    </button>);
    }
  },

  render() {
    const rowText = this.props.selectedIndexes.length === 1 ? 'row' : 'rows';
    return (
      <div className="react-grid-Toolbar">
        <div className="tools">
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
          {this.renderCurrencyButton()}
        </div>
      </div>);
  }
});

module.exports = Toolbar;
