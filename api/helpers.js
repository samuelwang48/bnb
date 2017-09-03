var R = require('ramda');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;

module.exports = function(MongoClient, url) {
  return {
    findHostIdByAirbnbPk: function(airbnb_pk, callback) {
      MongoClient.connect(url, function(err, db) {
         db.collection('hosts').find({
           airbnb_pk: airbnb_pk
         }).toArray(function(err, docs) {
           var ids = docs.map(function(d) { return d._id; });
           db.close();
           callback(ids);
         });
      });
    },
    updateSchedule: function(ids, calendar_months, callback) {
      MongoClient.connect(url, function(err, db) {
         var days = R.pipe(
           R.map(R.prop('days')),
           R.flatten,
           R.map(function(d) {
             d.local_price = d.price.local_price;
             d.local_currency = d.price.local_currency; 
             delete d.price;
             return d;
           })
         )(calendar_months);
         db.collection('hosts').updateMany(
           { _id: {$in: ids.map(function(id) { return ObjectId(id); })} },
           { $set: { 'schedule': days, 'tf': moment().format('M/D HH:mm') } }
         ).then(function() {
           //console.log(JSON.stringify(arguments))
           db.close();
           callback(days);
         })
      });
    },
    updateHost: function(ids, doc, callback) {
      MongoClient.connect(url, function(err, db) {
        var updated = {
          list_city: doc.listing.city,
          list_bedrooms: doc.listing.bedrooms,
          list_beds: doc.listing.beds,
          list_bathrooms: doc.listing.bathrooms,
          list_min_nights: doc.listing.min_nights,
          list_person_capacity: doc.listing.person_capacity,
          list_native_currency: doc.listing.native_currency,
          list_price: doc.listing.price,
          list_price_for_extra_person_native: doc.listing.price_for_extra_person_native,
          list_cleaning_fee_native: doc.listing.cleaning_fee_native,
          list_security_deposit_native: doc.listing.security_deposit_native,
          list_primary_host: {
            first_name: doc.listing.primary_host.first_name
          },
          list_check_out_time: doc.listing.check_out_time,
          list_property_type: doc.listing.property_type,
          list_reviews_count: doc.listing.reviews_count,
          list_star_rating: doc.listing.star_rating,
          list_room_type_category: doc.listing.room_type_category,
          list_check_in_time: doc.listing.check_in_time,
          list_check_in_time_ends_at: doc.listing.check_in_time_ends_at,
          list_guests_included: doc.listing.guests_included,
          list_thumbnail_urls: doc.listing.thumbnail_urls,
          list_map_image_url: doc.listing.map_image_url,
          'hf': moment().format('M/D HH:mm'),
        };
        db.collection('hosts')
          .updateMany(
            {_id: {$in: ids.map(function(id) { return ObjectId(id); })}},
            {$set: updated}
          )
          .then(function() {
            db.close();
            callback(updated);
          });
      });
    },
    getHostsWithSchedule: function(docs, startDate, endDate) {
      var match = [];
      docs.forEach(function(doc) {
        var days = doc.schedule;
        if (days) {
          var d0 = moment(startDate);
          var d1 = moment(endDate);
          var delta = d1.diff(d0, 'days');
          var availability = [];
      
          for (var i=0; i<delta; i++) {
             var d = d0.format('YYYY-MM-DD');
             var avail = R.pipe(
               R.find(R.propEq('date', d))
             )(days);
    
             availability.push(avail || {});
      
             d0.add(1, 'days');
          }
      
          delete doc.schedule;
          doc.availability = availability;
          match.push(doc);
        } else {
          delete doc.schedule;
          doc.availability = [];
          match.push(doc);
        }
      });
      return match;
    }
  }
};
