var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');


router.param('username', function(req, res, next, username){
  User.findOne({username: username}).then(function(user){
    if(!user) {return res.sendStatus(404); }

    req.profile = user;

    return next();
  }).catch(next);
});

router.get('/:username', auth.optional, function(req, res, next){
  if(req.payload){
    User.findById(req.payload.id).then(function(user){
      if(!user){ return res.json({profile: req.profile.toProfileJSONFor(false)});}

      return res.json({profile: req.profile.toProfileJSONFor(user)});
    });
  } else {
    return res.json({profile: req.profile.toProfileJSONFor(false)});
  }

});

router.post('/:username/friend', auth.required, function(req, res, next){
  var profileId = req.profile._id;

  User.findById(req.payload.id).then(function(user){
    if(!user) {return res.sendStatus(401);}
    return user.friend(profileId).then(function(){
      return res.json({profile: req.profile.toProfileJSONFor(user)});
    });
  }).catch(next);
});

router.delete('/:username/friend', auth.required, function(req, res, next){
  var profileId = req.profile._id;

  User.findById(req.payload.id).then(function(user){
    if(!user) {return res.sendStatus(401);}
    return user.unfriend(profileId).then(function(){
      return res.json({profile: req.profile.toProfileJSONFor(user)});
    });
  }).catch(next);
});

router.post('/:username/request', auth.required, function(req, res, next){
  const currentUserId = req.payload.id;
  const otherUserId = req.profile._id;

  const addIdToUserSentRequests = function(userId, idToAdd) {
    return User.findById(userId).then(function(user){
      if(!user) {return res.sendStatus(404);}
      user.sendRequest(idToAdd);
    });
  }

  const addIdToUserRecievedRequests = function(userId, idToAdd) {
    return User.findById(userId).then(function(user){
      if(!user) {return res.sendStatus(404);}
      user.recieveRequest(idToAdd);
    });
  }

  addIdToUserSentRequests(currentUserId, otherUserId).then(function() {
    addIdToUserRecievedRequests(otherUserId, currentUserId).then(function(user) {
      return res.json({profile: req.profile.toProfileJSONFor(user)});
    });
  }).catch(next);
});

module.exports = router;
