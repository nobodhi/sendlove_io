const utils = require('./utils'); // HACK need access to export function
const UserCookie = require('../models/UserCookie');

// var tokens = [];

exports.getMaxAge = function () {
  const maxAge = 1000 * 60 * 60 * 24 * 14;

  return maxAge;
};

/*
 consume a remember_me token: if found returns a uid
*/
exports.consumeRememberMeToken = function (cookieToken, fn) {
  let uid = '';

  // console.log(`in consumeRememberMeToken, looking for cookieToken= ${cookieToken}`);
  UserCookie.findOne({cookieToken: cookieToken.toString()}, (err, existingCookie) => {
    if (existingCookie) {
      uid = existingCookie.uid;
      // console.log(`found an existing cookie for uid= ${uid}`);
    } else {
      // console.log('did not find an existing cookie, the user cannot be logged in');
    }
  });
  return fn(null, uid);
};

/*
 issues a new token. called from passport.js in RememberMeStrategy and from user.js in login
 TODO what if a hacker just passes a new token for the given uid?
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

// can only be called from issueToken, in the context of a user. we create the token and insert it simultaneously.
function saveRememberMeToken (cookieToken, uid, fn) {
  console.log('in saveRememberMeToken');
  const maxAge = utils.getMaxAge();
  const milliseconds = new Date().getTime() + maxAge;
  const cookieExpires = new Date(milliseconds);

  // console.log(`maxAge= ${maxAge}`);
  // console.log(`milliseconds= ${milliseconds}`);
  // console.log(`cookieExpires= ${cookieExpires}`);

  // if the uid exists attempt to overwrite. do not use upsert so that our middleware fires.
  UserCookie.findOne({uid}, (err, existingCookie) => {
    if (existingCookie) {
      // console.log('found an existing cookie, attempting to update');
      existingCookie.cookieToken = cookieToken;
      existingCookie.save((saveErr) => {
        if (saveErr) {
         console.log(saveErr);
        }
     });
    //  console.log('existing cookie should now be saved');
    } else {
      // console.log('did not find an existing cookie, attempting to insert');
      const userCookie = new UserCookie({
       uid,
       cookieToken,
       cookieExpires
      });

      userCookie.save((saveErr) => {
       if (saveErr) {
         console.log(saveErr);
       }
      //  console.log('the cookie has supposedly been saved to the database');
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
