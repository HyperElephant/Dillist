var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

/* GET users listing. */
router.get('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

router.get('/friends', auth.required, function(req, res, next){
  console.log("friends");
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }    
    var limit = 20;
    var offset = 0;
  
    if(typeof req.query.limit !== 'undefined'){
      limit = req.query.limit;
    }
  
    if(typeof req.query.offset !== 'undefined'){
      offset = req.query.offset;
    }

    var query = {};
    var friendsList = user.friends ? user.friends : [];
    query._id = {$in :  friendsList};
    
    Promise.all([
      User.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .exec()
    ]).then(function(results){
      var users = results[0];
      var userCount = results[0].length;
  
      return res.json({
        friends: users.map(function(friend){
          return friend.toProfileJSONFor(user);
        }),
        friendCount: userCount
      });
    }).catch(next);
  });
});

router.get('/users', auth.required, function(req, res, next) {
  console.log("users");
  User.findById(req.payload.id).then(function(currentUser){
    if(!currentUser){ return res.sendStatus(401); }  
    var limit = 20;
    var offset = 0;

    if(typeof req.query.limit !== 'undefined'){
      limit = req.query.limit;
    }

    if(typeof req.query.offset !== 'undefined'){
      offset = req.query.offset;
    }
    var query = {};
    query._id = {$nin: currentUser._id};

    Promise.all([
      User.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .exec(),
      User.count()
    ]).then(function(results){
      var users = results[0];
      var userCount = results[1];

      return res.json({
        users: users.map(function(user){
          return user.toProfileJSONFor(currentUser);
        }),
        userCount: userCount
      });
    }).catch(next);
  });
});

router.put('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.email !== 'undefined'){
      user.email = req.body.user.email;
    }
    if(typeof req.body.user.password !== 'undefined'){
      user.setPassword(req.body.user.password);
    }

    return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
  }).catch(next);
  });

router.post('/users/login', function(req, res, next){
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/users', function(req, res, next){
  var user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user.save().then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

module.exports = router;
