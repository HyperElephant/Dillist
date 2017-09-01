var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Wish = mongoose.model('Wish');
var User = mongoose.model('User');
var auth = require('../auth');

router.param('wish', function(req, res, next, id) {
  Wish.findById(id).populate('author').populate('giver')
  .exec().then(function(wish){
    if(!wish) { return res.sendStatus(404); }

    req.wish = wish;
    var authorName = req.wish.author.username.toString();
    return next();
  }).catch(next);
});

router.param('user', function(req, res, next, username) {
  User.findOne({username: username}).then(function(user){
    if(!user) { return res.sendStatus(404); }

    req.user = user;

    return next();
  }).catch(next);
});

router.post('/wishes', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var wish = new Wish(req.body.wish);

    wish.author = user;

    return wish.save().then(function(){
      
      return res.json({wish: wish.toJSONFor(user)});
    });
  }).catch(next);
})

router.post('/wishes/:wish', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var wish = new Wish(req.body.wish);

    wish.author = user;

    return wish.save().then(function(){
      console.log(wish.author);
      return res.json({wish: wish.toJSONFor(user)});
    });
  }).catch(next);
})

router.post('/wishes/:wish/claim', auth.required, function(req, res, next){
  console.log(req.payload);

  User.findById(req.payload.id).then(function(user){
    if(!user) {return res.sendStatus(401);}
    return req.wish.claim(user).then(function(){
      return res.json({wish: req.wish.toJSONFor(user)});
    });
  }).catch(next);
  
});

router.post('/wishes/:wish/unclaim', auth.required, function(req, res, next){
  console.log(req.payload);

  User.findById(req.payload.id).then(function(user){
    if(!user) {return res.sendStatus(401);}
    return req.wish.unclaim(user).then(function(){
      return res.json({wish: req.wish.toJSONFor(user)});
    });
  }).catch(next);
  
});

router.get('/wishes', auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;
  
  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }
    
    Promise.all([
      Wish.find({ author: user})
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author')
        .populate('giver')
        .exec(),
      Wish.count({ author: user})
    ]).then(function(results){
      var wishes = results[0];
      var wishesCount = results[1];

      return res.json({
        wishes: wishes.map(function(wish){
          return wish.toJSONFor(user);
        }),
        wishesCount: wishesCount
      });
    }).catch(next);
  });
});

router.get('/wishes/:user', auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  User.findById(req.user.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    Promise.all([
      Wish.find({ author: user})
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author')
        .populate('giver')
        .exec(),
      Wish.count({ author: user})
    ]).then(function(results){
      var wishes = results[0];
      var wishesCount = results[1];

      return res.json({
        wishes: wishes.map(function(wish){
          return wish.toJSONFor(user);
        }),
        wishesCount: wishesCount
      });
    }).catch(next);
  });
});

router.delete('/wishes/:wish', auth.required, function(req, res, next) {
  var authorName = req.wish.author.username.toString();
  var username = req.payload.username.toString();
  if(req.wish.author.username.toString() === req.payload.username.toString()){
    return req.wish.remove().then(function(){
      return res.sendStatus(204);
    });
  } else {
    return res.sendStatus(403);
  }
});

module.exports = router;
