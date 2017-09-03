var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true,
    required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
    index: true},
  email: {type: String, lowercase: true, unique: true,
    required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true},
  hash: String,
  salt: String,
  friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  sentRequests: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  recievedRequests: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

UserSchema.methods.toAuthJSON = function(){
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
  };
};

UserSchema.methods.toProfileJSONFor = function(user){
  return {
    username: this.username,
    isFriend: user ? user.isFriend(this._id) : false
  };
};

UserSchema.methods.friend = function(id){
	if(this.friends.indexOf(id) === -1){
		this.friends.push(id);
	}
	return this.save();
};

UserSchema.methods.unfriend = function(id){
	this.friends.remove(id);
	return this.save();
};

UserSchema.methods.isFriend = function(id){
	return this.friends.some(function(friendId){
		return friendId.toString() === id.toString();
	});
};

UserSchema.methods.sendRequest = function(id){
  if(!this.sentRequests.includes(id)) {
    this.sentRequests.push(id);
  }
  return this.save();
};

UserSchema.methods.recieveRequest = function(id){
  if(!this.recievedRequests.includes(id)) {
    this.recievedRequests.push(id);
  }
  return this.save();
};

UserSchema.methods.removeRequest = function(id){
  const recievedIndex = this.recievedRequests.indexOf(id);
  const sentIndex = this.sentRequests.indexOf(id);
  if (recievedIndex > -1) {
    this.recievedRequests.splice(recievedIndex, 1);
  }
  if (sentIndex > -1) {
    this.sentRequests.splice(sentIndex, 1);
  }
  return this.save();
}

UserSchema.methods.requestIsSent = function(id) {
  return this.sentRequests.some(function(sentRequest) {
    return sentRequest.toString() === id.toString();
  });
};

UserSchema.methods.requestIsRecieved = function(id) {
  return this.recievedRequests.some(function(recieveRequest) {
    return recieveRequest.toString() === id.toString();
  });
};

mongoose.model('User', UserSchema);
