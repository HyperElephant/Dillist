var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Wish = mongoose.model('Wish');
var User = mongoose.model('User');
var auth = require('../auth');

router.param('wish', function(req, res, next, id) {
  Wish.findById(id).then(function(wish){
    if(!wish) { return res.sendStatus(404); }

    req.wish = wish;

    return next();
  }).catch(next);
});

router.post('/wishes', auth.required, function(req, res, next){
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
        .exec(),
      Wish.count({ author: user.following})
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
  if(req.wish.author._id.toString() === req.payload.id.toString()){
    return req.wish.remove().then(function(){
      return res.sendStatus(204);
    });
  } else {
    return res.sendStatus(403);
  }
});

module.exports = router;
