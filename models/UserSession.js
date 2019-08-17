const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
   userId: {
      type: String,
      default: '',
   },
   userName: {
      type: String,
      default: '',
   },
   timestamp: {
      type: Date,
      default: Date.now(),
   },
   cart: {
      type: Array,
      default: [],
   },
   myRecipes: {
      type: Array,
      default: [],
   },
   searches: {
      type: Array,
      default: [],
   },
   isDeleted: {
      type: Boolean,
      default: false,
   }
});

module.exports = mongoose.model('UserSession', UserSessionSchema);
