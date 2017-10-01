var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

router.param('username', function(req, res, next, username){
  User.findOne({username: username}).then(function(user){
    if(!user) {
      console.log("Username not found");
      return res.sendStatus(404); 
    }

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
      if(!user) {
        console.log(userId + " not found in addIdToUserSentRequests");
        return res.sendStatus(404);
      }
      user.sendRequest(idToAdd);
      return user;
    });
  }

  const addIdToUserRecievedRequests = function(userId, idToAdd) {
    return User.findById(userId).then(function(user){
      if(!user) {
        console.log(userId + " not found in addIdToUserRecievedRequests");
        return res.sendStatus(404);
      }
      user.recieveRequest(idToAdd);
      return user;
    });
  }

  addIdToUserSentRequests(currentUserId, otherUserId).then(function(currentUser) {
    addIdToUserRecievedRequests(otherUserId, currentUserId).then(function(otherUser) {
      return res.json({profile: req.profile.toProfileJSONFor(currentUser)});
    });
  }).catch(next);
});

router.post('/:username/accept', auth.required, function(req, res, next){
  const currentUser = req.payload;
  const otherUser = req.profile;

  // function otherRequestedCurrent(otherUserID, currentUserID) {
  //   User.findById(otherUserID).then(function(otherUser) {
  //     User.findById(currentUserID).then(function(currentUser) {
  //       var sentAndRecieved = otherUser.checkRequestSentAndUserRecieved(currentUser);
  //       console.log("Sent and recieved: " + sentAndRecieved);
  //       return (sentAndRecieved);
  //     })
  //   })
  // }

  User.findById(req.payload.id).then(function(currentUser){
    if(otherUser.checkRequestSentAndUserRecieved(currentUser)){
      console.log("Ready to accept.");
    }
  });

  // console.log("Checking...");

  // var requested = otherUser.checkRequestSentAndUserRecieved(currentUser);

  // console.log("Requested: " + requested);

  // if (requested) {
  //   console.log("Ready to accept.");
  // }
});

module.exports = router;
