var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var User = mongoose.model('User');

var WishSchema = new mongoose.Schema({
  title: String,
  url: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

WishSchema.plugin(uniqueValidator, {message: 'is already taken'});

WishSchema.methods.toJSONFor = function(user) {
  return{
    id: this._id,
    title: this.title,
    url: this.url,
    author: this.author.toProfileJSONFor(user)
  };
};

mongoose.model('Wish', WishSchema);
