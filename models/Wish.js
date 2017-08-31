var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var User = mongoose.model('User');

var WishSchema = new mongoose.Schema({
  title: String,
  url: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  giver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

WishSchema.plugin(uniqueValidator, {message: 'is already taken'});

WishSchema.methods.toJSONFor = function(user) {
  return{
    id: this._id,
    title: this.title,
    url: this.url,
    author: this.author.toProfileJSONFor(user),
    giver: this.giver.toProfileJSONFor(user)
  };
};

WishSchema.methods.claim = function(id){
	if(!this.giver){
		this.giver = id;
	}
	return this.save();
};

WishSchema.methods.unClaim = function(id){
	if(this.giver === id){
    this.giver = null;
  }
	return this.save();
};

WishSchema.methods.haveClaimed = function(id){
	return(this.giver === id);
};

mongoose.model('Wish', WishSchema);
