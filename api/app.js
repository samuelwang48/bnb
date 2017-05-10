var express = require('express');
var airbnb = require('airapi');
var app = express();

var MongoClient = require('mongodb').MongoClient;


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

app.get('/host', function (req, res) {
    // Connection url
    var url = 'mongodb://localhost:27017/db';
    // Connect using MongoClient
    MongoClient.connect(url, function(err, db) {
       db.collection('bnb').find().toArray(function(err, docs) {
         res.setHeader('Content-Type', 'application/json');
         res.send(JSON.stringify(docs));
         db.close();
       });
    });
})

app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
})
