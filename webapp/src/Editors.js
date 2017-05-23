import React from 'react';
const ReactDOM = require('react-dom');
const Autocomplete = require('react-autocomplete');

const RegionEditor = React.createClass({
  getInitialState() {
    this.styles = {
      item: {
        padding: '2px 6px',
        cursor: 'default'
      },
      highlightedItem: {
        color: 'white',
        background: 'hsl(200, 50%, 50%)',
        padding: '2px 6px',
        cursor: 'default'
      },
      menu: {
        border: 'solid 1px #ccc'
      }
    };

    return {
      value: '',
      items: this.props.items(),
    }
  },

  getInputNode() {
    return ReactDOM.findDOMNode(this).getElementsByTagName('input')[0];
  },

  getValue(): any {
    let updated = {};
    updated[this.props.col] = this.state.value;
    return updated;
  },

  handleUpdated(col, item) {
    this.props.onUpdate(col, item);
  },

  render() {
    return (
      <Autocomplete
        ref={el => this.input = el}
        value={this.state.value}
        items={this.state.items}
        getItemValue={(item) => item.title}
        shouldItemRender={(state, value) => {
          return (
            state.title.toLowerCase().indexOf(value.toLowerCase()) !== -1
          )
        }}
        onSelect={(event, item) => {
          this.setState({ value: item.title });
          this.handleUpdated(this.props.col, item);
        }}
        onChange={(event, value) => {
          this.setState({ value: value })
        }}
        renderItem={(item, isHighlighted) => (
          <div style={isHighlighted ? this.styles.highlightedItem : this.styles.item}>{item.title}</div>
        )}
        menuStyle={{
          borderRadius: '3px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2px 0',
          fontSize: '90%',
          position: 'fixed',
          overflow: 'auto',
          maxHeight: '50%',
          zIndex: 1
        }}
      />
    )
  }
});

module.exports = {
  RegionEditor: RegionEditor
}
