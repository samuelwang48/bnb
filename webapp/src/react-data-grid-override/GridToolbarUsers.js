import React, { Component } from 'react';
require('../../react-data-grid/themes/react-data-grid-toolbar.css');
import {
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

  componentDidMount = () => {
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
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
};

module.exports = Toolbar;
