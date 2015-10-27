var express = require('express');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var app = express();

//read config from file
var config = require('config');

var redis = require("redis").createClient(config.get('redis'));
var users = config.get('users');




//configure express body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// check authentification
var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  var user = basicAuth(req);

  if (!user) {
    return unauthorized(res);
  };


  if (users[user.name] && user.pass === users[user.name]) {
    return next();
  } else {
    return unauthorized(res);
  };
};

//retrieve user from basic authentication
var getUser = function(req) {
  var user = basicAuth(req);
  if (!user || !user.name) {
    req.status(401).send('basic authentification missing');
  }
  return user.name;
}


//read and serve blob from redis
var read = function(req, res) {
  var user = getUser(req);
  redis.get(user, function(err, data){
    if(err){
      res.send({status: 'error', error: 'database error: ' + err});
    } else {
      res.send({
        'status': 'ok',
        'result': data
      });
    }

  });
 
}

//store blob to redis
var write = function(req, res) {
  var user = getUser(req);

  if(!req.body || !req.body.data){
    res.send({status: 'error', error: 'data missing or invalid'});
  }
  var data = req.body.data.replace(/ /g, '+');
  redis.set(user, data, function(err){
    if(err){
      res.send({status: 'error', error: 'database error: ' + err});
    } else {
      res.send({status: 'ok'});
    }
  });
}

//remove blob from redis
var remove = function(req, res) {
  var user = getUser(req);
  redis.del(user, function(err){
    if(err){
      res.send({status: 'error', error: 'database error: ' + err});
    } else {
      res.send({status: 'ok'});
    }
  });
}

//routes
app.get('*/read', auth, read);
app.post('*/read', auth, read);
app.post('*/write', auth, write);
app.post('*/delete', auth, remove);

app.get('*/', function(req, res){
  res.send('SESAM Sync Server is up and running.');
});


var port = config.get('port')
app.listen(port);
console.log('SESAM running on port ' + port);