import React, { Component } from 'react';
import moment from 'moment'
require('../../react-data-grid/themes/react-data-grid-toolbar.css');
import { DateRange } from 'react-date-range';
import Popover from 'material-ui/Popover';
import TextField from 'material-ui/TextField';
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
      matchButtonText: '匹配选中行',
      saveButtonText: '保存全部',
      deleteButtonText: '删除选中行',
    };
  }

  getDefaultProps = () => {
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

  onMatch = () => {
    if (this.props.onMatch !== null && this.props.onMatch instanceof Function) {
      this.props.onMatch();
    }
  }

  renderToggleFilterButton = () => {
    return (<span></span>)
    if (this.props.enableFilter) {
      return (<button type="button" className="btn" onClick={this.props.onToggleFilter}>
      {this.state.filterRowsButtonText}
    </button>);
    }
  }

  renderMatchButton = () => {
    if (this.props.onMatch ) {
      return (<button type="button" className="btn" onClick={this.onMatch}>
        {this.state.matchButtonText}
      </button>);
    }
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
                {this.renderToggleFilterButton()}
                {this.props.children}
                &nbsp;
                <span>{this.props.selectedIndexes.length}/{this.props.rows.length} {rowText} selected</span>
                &nbsp;
                {this.renderDeleteButton()}
                &nbsp;
                {this.renderMatchButton()}
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
};

module.exports = Toolbar;
