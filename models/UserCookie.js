const mongoose = require('mongoose');

const userCookieSchema = new mongoose.Schema({
  uid: {type: String, unique: true},
  cookieToken: String,
  cookieExpires: Date
},
{timestamps: true});

// // prevent a database change to just the expiration date TODO only execute on update, not insert
// userCookieSchema.pre('save', function (next) {
//   const userCookie = this;
//
//   if (!userCookie.isModified('cookieToken')) {
//     return next();
//   }
// });

const UserCookie = mongoose.model('UserCookie', userCookieSchema);

module.exports = UserCookie;
