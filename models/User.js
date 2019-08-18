const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
   username: {
      type: String,
      required: true,
      default: ''
   },
   password: {
      type: String,
      required: true,
      default: '',
   },
   isDeleted: {
      type: Boolean,
      default: false,
   },
   date: {
      type: Date,
      default: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
   }
});

UserSchema.methods.generateHash = function(password) {
   return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
   return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
