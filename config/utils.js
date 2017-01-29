const utils = require('./utils'); // HACK need access to export function
const UserCookie = require('../models/UserCookie');

// var tokens = [];

exports.getMaxAge = function () {
  const maxAge = 1000 * 60 * 60 * 24 * 7; // one week

  return maxAge;
};

/*
  remove a UserCookie by uid - only call this from a user session object
*/
exports.deleteToken = function (uid, cookieToken, done) {
  console.log('delete the user object');
  UserCookie.findOne({uid, cookieToken}, (err, userCookie) => {
    if (err) {
      return done(err);
    }
    if (userCookie) {
      userCookie.remove();
    }
  });
  // TODO return done(null, false)?
};

/*
 issues a new token. called from passport.js in RememberMeStrategy and from user.js in login
 */
exports.issueToken = function (user, done) {
  const cookieToken = randomString(64);

  saveRememberMeToken(cookieToken, user.id, function (err) {
    if (err) {
      return done(err);
    }
    return done(null, cookieToken); // TODO return maxAge
  });
};

/*
  only called from issueToken, in the context of a user. we create the token and insert it simultaneously.
  (node:12936) DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated,
  plug in your own promise library instead: http://mongoosejs.com/docs/promises.html
*/
function saveRememberMeToken (cookieToken, uid, fn) {
  console.log('in saveRememberMeToken');
  UserCookie.findOne({uid, cookieToken}, (err, existingCookie) => {
    if (existingCookie) {
    console.log('warning: saveRememberMeToken found an existing cookie');
    } else {
      console.log('inserting new cookie record');
      const maxAge = utils.getMaxAge();
      const milliseconds = new Date().getTime() + maxAge;
      const cookieExpires = new Date(milliseconds);

      // console.log(`maxAge= ${maxAge}`);
      // console.log(`milliseconds= ${milliseconds}`);
      // console.log(`cookieExpires= ${cookieExpires}`);
      const userCookie = new UserCookie({
       uid,
       cookieToken,
       cookieExpires
      });

      userCookie.save((saveErr) => {
       if (saveErr) {
         console.log(saveErr);
       }
      });
    }
  });
  return fn(); // TODO return maxAge
}

function randomString (len) {
  const buf = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charlen = chars.length;

  for (let i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
}

function getRandomInt (min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}
