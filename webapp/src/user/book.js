import React, { Component } from 'react';

const axios = require('axios');

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import {Card, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import StarRatingComponent from '../lib/StarRatingComponent.jsx';

import {
  Row,
  Col,
} from 'react-bootstrap';

class UserBook extends Component {
  constructor(props) {
    super(props);

    this.state = {
      api: 'http://' + window.location.hostname + ':8000',
      host: null
    };
  };

  render() {
      if (this.state.host) {

        let host = this.state.host;

        host.images = host.list_thumbnail_urls.map(function(t) {
          return {
            original: t.replace(/small$/, 'large'),
            thumbnail: t,
          }
        });

        return (
          <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <Card>
              <CardMedia
                overlay={<CardTitle title={
                  host.city + ' · ' + host.list_beds + '张床'
                } subtitle={
                  <StarRatingComponent 
                      name="rate1" 
                      starCount={5}
                      value={host.list_star_rating}
                      renderStarIcon={(index, value) => {
                        return <span className={index <= value ? 'fa fa-star' : 'fa fa-star-o'} />;
                      }}
                      renderStarIconHalf={() => <span className="fa fa-star-half-full" />}
                  />
                } />}
              >
                <img src={host.images[0].original} alt="" />
              </CardMedia>
              <CardTitle title="预订" subtitle="" />
              <CardText>
                <Row>
                  <Col xs={6}>入住</Col>
                  <Col xs={6}>退房</Col>
                </Row>
                <Row>
                  <Col xs={6}>{this.props.reservation.startDateStr}</Col>
                  <Col xs={6}>{this.props.reservation.endDateStr}</Col>
                </Row>
              </CardText>
              <CardActions>
                <FlatButton label="Action1" />
                <FlatButton label="Action2" />
              </CardActions>
            </Card>
          </MuiThemeProvider>
        )
      }
      else {
        return (
          <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <div></div>
          </MuiThemeProvider>
        )
      }
  }

  componentWillMount() {
    let com = this;
    const api = this.state.api;

    axios
      .get(api + '/host/' + this.props.match.params.id)
      .then(function(response) {
        com.setState({host: response.data});
      });
  }
}
export default UserBook;
