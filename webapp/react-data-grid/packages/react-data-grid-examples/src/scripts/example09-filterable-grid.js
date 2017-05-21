const ReactDataGrid = require('react-data-grid');
const exampleWrapper = require('../components/exampleWrapper');
const React = require('react');
const { Toolbar, Data: { Selectors } } = require('react-data-grid-addons');

const Example = React.createClass({
  getInitialState() {
    this._columns = [
      {
        key: 'id',
        name: 'ID',
        width: 80,
        filterable: true
      },
      {
        key: 'task',
        name: '1Title',
        filterable: true,
        width: 500
      },
      {
        key: 'priority',
        name: '1Priority',
        filterable: true,
        width: 500
      },
      {
        key: 'issueType',
        name: '1Issue Type',
        filterable: true,
        width: 500
      },
      {
        key: 'complete',
        name: '1% Complete',
        filterable: true,
        width: 500
      },
      {
        key: 'startDate',
        name: '1Start Date',
        filterable: true,
        width: 500
      },
      {
        key: 'completeDate',
        name: '1Expected Complete',
        filterable: true,
        width: 500
      }
    ];

    return { rows: this.createRows(), filters: {} };
  },

  getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toLocaleDateString();
  },

  createRows() {
    let rows = [];
    for (let i = 1; i < 1000; i++) {
      rows.push({
        id: i,
        task: 'Task ' + i,
        complete: Math.min(100, Math.round(Math.random() * 110)),
        priority: ['Critical', 'High', 'Medium', 'Low'][Math.floor((Math.random() * 3) + 1)],
        issueType: ['Bug', 'Improvement', 'Epic', 'Story'][Math.floor((Math.random() * 3) + 1)],
        startDate: this.getRandomDate(new Date(2015, 3, 1), new Date()),
        completeDate: this.getRandomDate(new Date(), new Date(2016, 0, 1))
      });
    }

    return rows;
  },

  getRows() {
    return Selectors.getRows(this.state);
  },

  getSize() {
    return this.getRows().length;
  },

  rowGetter(rowIdx) {
    let rows = this.getRows();
    return rows[rowIdx];
  },

  handleFilterChange(filter) {
    let newFilters = Object.assign({}, this.state.filters);
    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }
    this.setState({ filters: newFilters });
  },

  onClearFilters() {
    // all filters removed
    this.setState({filters: {} });
  },

  render() {
    return (
      <ReactDataGrid
        columns={this._columns}
        rowGetter={this.rowGetter}
        enableCellSelect={true}
        rowsCount={this.getSize()}
        minHeight={500}
        toolbar={<Toolbar enableFilter={true}/>}
        onAddFilter={this.handleFilterChange}
        onClearFilters={this.onClearFilters} />);
  }
});

const exampleDescription = (
  <p>While ReactDataGrid doesn't not provide the ability to filter directly, it does provide hooks that allow you to provide your own filter function. This is done via the <code>onAddFilter</code> prop. To enable filtering for a given column, set <code>column.filterable = true</code> for that column. Now when the header cell has a new filter value entered for that column, <code>onAddFilter</code> will be triggered passing the filter key and value.</p>);

module.exports = exampleWrapper({
  WrappedComponent: Example,
  exampleName: 'Filterable Columns Example',
  exampleDescription,
  examplePath: './scripts/example09-filterable-grid.js',
  examplePlaygroundLink: undefined
});
