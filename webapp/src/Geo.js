import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import geo from '../../geodata';

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

module.exports = {
  geo,
  getGeo
}
