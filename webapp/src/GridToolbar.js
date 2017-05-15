const React = require('react');
require('./react-data-grid/themes/react-data-grid-toolbar.css');

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
      filterRowsButtonText: 'Filter Rows'
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
        </div>
      </div>);
  }
});

module.exports = Toolbar;
