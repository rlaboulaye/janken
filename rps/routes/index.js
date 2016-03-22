var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

// We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var dbUrl = 'mongodb://localhost:27017/janken';

// we will use this variable later to insert and retrieve a "collection" of data
var collection;

// Use connect method to connect to the Server
MongoClient.connect(dbUrl, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    // HURRAY!! We are connected. :)
    console.log('Connection established to', dbUrl);
    collection = db.collection('matches');
  }
});

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile('index.html', { root: 'public' });
});

router.post('/matches', function(req, res, next) {
  collection.insert(req.body, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log('Inserted %d documents into the "matches" collection. The documents inserted with "_id" are:', result.length, result);
    res.end('{"success" : "Updated Successfully", "status" : 200}');
  }
});
});

router.get('/matches', function(req, res, next) {
  collection.find().toArray(function(err, result) {
    if(err)
    {
      console.log(err);
    }
    else if (result.length)
    {
      console.log("Query Worked");
      console.log(result);
      res.send(result);
    }
    else
    {
      console.log("No Documents found");
    }
  });
});

module.exports = router;
