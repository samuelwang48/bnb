var express = require('express');
var cors = require('cors')
var airbnb = require('./airapi');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '5mb' })); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' })); // support encoded bodies

app.use(cors());

var ObjectId = require('mongodb').ObjectID;

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/db';


app.post('/schedule', function (req, res) {
  var data = req.body.data;

  var promises = data.map(function(d) {
    var airbnb_pk = d.airbnb_pk;
    var _id = d._id;
    var dt = new Date();
    return new Promise(function(resolve, reject) {
      airbnb.getCalendar(airbnb_pk, {
        currency: 'USD',
        month: dt.getMonth() + 1,
        year: dt.getFullYear(),
        count: 3
      }).then(function(schedule) {
        MongoClient.connect(url, function(err, db) {
           db.collection('hosts').findOneAndUpdate(
             { _id: ObjectId(_id) },
             { $set: { 'schedule': schedule } }
           ).then(function() {
             console.log(JSON.stringify(arguments))
             db.close();
             resolve(schedule);
           })
        });
      }, function() {
        resolve({error: 'airbnb not found'});
      });
    });
  });

  Promise.all(promises).then(function(results) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results));
  });

})


app.get('/', function (req, res) {
  airbnb.search({
   location: '大阪',
   checkin: '06/03/2017',
   checkout: '06/06/2017',
   guests: 2,
   page: 5000,
  }).then(function(searchResults) {
    console.log(searchResults);
    res.send(searchResults)
  });
})

app.post('/fetch', function (req, res) {
  var data = req.body.data;

  var promises = data.map(function(d) {
    var airbnb_pk = d.airbnb_pk;
    var _id = d._id;
    return new Promise(function(resolve, reject) {
      airbnb.getInfo(airbnb_pk).then(function(doc) {
        MongoClient.connect(url, function(err, db) {
           if (_id) {
               db.collection('hosts')
                 .findOneAndUpdate(
                   {_id: ObjectId(_id)},
                   {$set: {
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
                     list_primary_host: doc.listing.primary_host,
                     list_check_out_time: doc.listing.check_out_time,
                     list_property_type: doc.listing.property_type,
                     list_reviews_count: doc.listing.reviews_count,
                     list_star_rating: doc.listing.star_rating,
                     list_room_type_category: doc.listing.room_type_category,
                     list_check_in_time: doc.listing.check_in_time,
                     list_check_in_time_ends_at: doc.listing.check_in_time_ends_at,
                     list_guest_included: doc.listing.guest_included,
                     list_thumbnail_urls: doc.listing.thumbnail_urls,
                     list_map_image_url: doc.listing.map_image_url,
                   }}
                 )
                 .then(function() {
                   db.collection('hosts')
                     .findOne({_id: ObjectId(_id)}).then(function(result){
                         console.log(result)
                         resolve(result);
                     });
                 });
           }
        });
      }, function() {
        resolve({error: 'airbnb not found'});
      });
    });
  });

  Promise.all(promises).then(function(results) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results));
  });
})

app.get('/host', function (req, res) {
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       db.collection('hosts').find().toArray(function(err, docs) {
         res.setHeader('Content-Type', 'application/json');
         res.send(JSON.stringify(docs));
         db.close();
       });
    });
})

app.post('/host', function (req, res) {
    var data = req.body.data;
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       data.forEach(function(d) {
           var _id = d._id;
           if (_id) {
               delete d._id;
               db.collection('hosts')
                 .replaceOne({_id: ObjectId(_id)}, d)
                 .then(function() {
                   db.close();
                 });
           } else {
               db.collection('hosts')
                 .insertOne(d)
                 .then(function() {
                   db.close();
                 });
           }
       })
       res.setHeader('Content-Type', 'application/json');
       res.send(JSON.stringify(data));
    });
})

app.delete('/host', function (req, res) {
    var data = req.body;
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       data.forEach(function(_id) {
         db.collection('hosts')
           .deleteOne({_id: ObjectId(_id)})
           .then(function() {
             db.close();
             res.setHeader('Content-Type', 'application/json');
             res.send(JSON.stringify(arguments));
           });
       })
    });
})

app.get('/currency',  function (req, res) {
    MongoClient.connect(url, function(err, db) {
      db.collection('currency').find().toArray(function(err, rates) {
        if (rates.length === 1) {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(rates));
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify([{
            usd2jpy: -1,
            usd2cny: -1,
          }]));
        }
        db.close();
      });
    });
})

app.post('/currency', function (req, res) {
    var data = req.body.data;
    var _db;
    var insertOne = function() {
      _db.collection('currency')
        .insertOne(data.currency)
        .then(function(err, r) {
           res.setHeader('Content-Type', 'application/json');
           res.send(JSON.stringify(data));
           db.close();
        });
    };

    MongoClient.connect(url, function(err, db) {
       _db = db;
       db.collection('currency').find().toArray(function(err, rates) {
         if (rates.length === 0 && data.currency) {
            insertOne();
         } else {
            db.collection('currency').drop(insertOne);
         }
       });
    });
})

app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
})
