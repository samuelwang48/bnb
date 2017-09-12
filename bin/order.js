const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/db';
const orderProcess = require('../api/bpm/order');

orderProcess(MongoClient, url).cli_run();
