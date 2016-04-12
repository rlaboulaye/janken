var express = require('express');

var router = express.Router();

var sha256 = require('js-sha256');

var mongoose = require('mongoose'); //Adds mongoose as a usable dependency

mongoose.connect('mongodb://localhost/janken'); //Connects to a mongo database called "janken"
require('../models/match');

var Match = mongoose.model('Match'); //Makes an object from that schema as a model
var User = mongoose.model('User');

var db = mongoose.connection; //Saves the connection as a variable to use
db.on('error', console.error.bind(console, 'connection error:')); //Checks for connection errors
db.once('open', function() { //Lets us know when we're connected
  console.log('Connected');
});


/*
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
*/


/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile('index.html', { root: 'public' });
});

router.param('recordUser', function(req, res, next, name) {
  var query = Match.find({username: name});
  query.exec(function (err, matches){
    if (err) { return next(err); }
    if (!matches) { return next(new Error("can't find matches")); }
    var wins = 0, ties = 0, losses = 0;
    console.log(matches);
    for (var i = 0; i < matches.length; i++) {
      for (var j = 0; j < matches[i].games.length; j++) {
        if (matches[i].games[j].result == 0) {
          losses++;
        } else if (matches[i].games[j].result == 1) {
          ties++;
        } else if (matches[i].games[j].result == 2) {
          wins++;
        }
      }
    }
    req.record = {win: wins, tie: ties, loss: losses};
    return next();
  });
});

router.get('/record/:recordUser', function(req, res) {
  console.log(req.record);
  res.json(req.record);
});

router.param('toHash', function(req, res, next, toHash) {
  req.hash = sha256(toHash);
  return next();
})

router.get('/hash/:toHash', function(req, res) {
  console.log(req.hash);
  res.json({hash: req.hash});
});

router.param('matchUser', function(req, res, next, name) {
  var query = Match.find({username: name});
  query.exec(function (err, matches){
    if (err) { return next(err); }
    if (!matches) { return next(new Error("can't find matches")); }
    req.matches = matches;
    return next();
  });
});

router.get('/match/:matchUser', function(req, res) {
  res.json(req.matches);
});

router.post('/matches', function(req, res, next) {
  var match = new Match(req.body);
  match.save(function(err, match){
    if(err){ return next(err); }
    res.json(match);
  });
});

router.get('/matches', function(req, res, next) {
  var query = Match.find();
  query.exec(function (err, matches){
    if (err) { return next(err); }
    if (!matches) { return next(new Error("can't find matches")); }
    res.json(matches);
  });
});

router.param('username', function(req, res, next, name) {
  var query = User.findOne({username: name});
  query.exec(function (err, user){
    if (err) { return next(err); }
    if (!user) { return next(new Error("can't find user")); }
    req.user = user;
    return next();
  });
});

router.get('/user/:username', function(req, res) {
  res.json(req.user);
});

router.put('/user/:username/increment', function(req, res, next) {
  req.user.increment(function(err, user){
    if (err) { return next(err); }
    res.json(user);
  });
});

router.get('/users', function(req, res) {
  var query = User.find();
  query.exec(function (err, users){
    if (err) { console.log(err) }
    if (!users) { console.log('no users') }
    req.users = users;
    res.json(req.users);
  });
});

router.post('/user', function(req, res, next) {
  var user = new User(req.body);
  user.save(function(err, user){
    if(err){ return next(err); }
    res.json(user);
  });
});

module.exports = router;
