var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Wish = mongoose.model('Wish');
var User = mongoose.model('User');
var auth = require('../auth');

router.post('/', auth.required, function(req, res, next){
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

module.exports = router;
