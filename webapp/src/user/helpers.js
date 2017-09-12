import React from 'react';
var R = require('ramda');
import {
  Row,
  Col,
} from 'react-bootstrap';


module.exports = function(context) {
  return {
    genRowNights(hostSchedule, startDate, endDate, numberOfNights) {
      // nights
      let priceNights = 0;
      let rowNights = [];
      for (var i = 0; i < numberOfNights; i++) {
          let date = startDate.add(i, 'days');
          let dateStr = date.format('YYYY-MM-DD');
          let schedule = R.find(R.propEq('date', dateStr))(hostSchedule);
          schedule = this.exchange(schedule, 'local_currency', 'local_price', 'local_price_conv');
          rowNights.push(
            <Row key={i}>
              <Col xs={6}>{dateStr}</Col>
              <Col xs={6} className="text-right">
                {schedule.local_price_conv}
              </Col>
            </Row>
          )
          priceNights += parseInt(schedule.local_price, 10);
      }
      this.priceNights = priceNights;
      return rowNights;
    },
    genRowCleaning(host) {
      host = this.exchange(host,
        'list_native_currency', 'list_cleaning_fee_native', 'list_cleaning_fee_native_conv');
      let rowCleaning = [
        <Row key={0}>
          <Col xs={6}>清洁费</Col>
          <Col xs={6} className="text-right">{host.list_cleaning_fee_native_conv}</Col>
        </Row>
      ];
      this.priceCleaning = host.list_cleaning_fee_native;
      return rowCleaning;
    },
    genRowExtraPersonTotal(host, numberOfNights) {
      const totalPerson = parseInt(context.state.numberOfAdults, 10)
                        + parseInt(context.state.numberOfKids, 10);
      const incluedPerson = host.list_guests_included;
  
      let extraPerson = 0;
      if (totalPerson > incluedPerson) {
        extraPerson = totalPerson - incluedPerson;
      }
  
      host.extra_person_native_total = host.list_price_for_extra_person_native
        * extraPerson
        * numberOfNights;
      
      host = this.exchange(host,
        'list_native_currency',
        'extra_person_native_total',
        'extra_person_native_total_conv');
      
      host = this.exchange(host,
        'list_native_currency',
        'list_price_for_extra_person_native',
        'list_price_for_extra_person_native_conv');
  
      let rowExtraPerson = [
        <Row key={0}>
          <Col xs={8}>超员费
            ( {host.list_price_for_extra_person_native_conv}
            &nbsp;x&nbsp;{extraPerson}人
            &nbsp;x&nbsp;{numberOfNights}晚 )
          </Col>
          <Col xs={4} className="text-right">{host.extra_person_native_total_conv}</Col>
        </Row>
      ];
      this.priceExtraPersonTotal = host.extra_person_native_total;
  
      return rowExtraPerson;
    },
    genRowTotal(host) {
      let priceTotal = this.priceNights
                     + this.priceCleaning
                     + this.priceExtraPersonTotal;
  
      let obj = {priceTotal: priceTotal};
  
      obj = this.exchange(obj,
        host.list_native_currency,
        'priceTotal',
        'priceTotalConv');
  
      this.priceTotal = priceTotal;
  
      return [
        <Row key={0}>
          <Col xs={6}>总计</Col>
          <Col xs={6} className="text-right">{obj.priceTotalConv}</Col>
        </Row>
      ];
    },
    exchange(obj, currency, from, to) {
      if ((obj[currency] || currency) === 'USD') {
        obj.usd = Math.round(obj[from]);
        // then calculate other currencies based on currentCurrency
        if (context.state.currentCurrency === 'usd') {
          // do nothing
          obj[to] = '$' + Math.round(obj.usd);
        }
        else if (context.state.currentCurrency === 'jpy') {
          const usd2jpy = context.state.currency.usd2jpy;
          obj[to] = Math.round(obj.usd * usd2jpy) + '円';
        }
        else if (context.state.currentCurrency === 'cny') {
          const usd2cny = context.state.currency.usd2cny;
          obj[to] = Math.round(obj.usd * usd2cny) + '元';
        }
        return obj;
      }
    }
  }
}
