var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var WishSchema = new mongoose.Schema({
  title: String,
  url: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

WishSchema.plugin(uniqueValidator, {message: 'is already taken'});

WishSchema.methods.toJSONFor = function(wish) {
  return{
    title: this.title,
    url: this.url,
    author: this.author.toProfileJSONFor(user)
  };
};

mongoose.model('Wish', WishSchema);
