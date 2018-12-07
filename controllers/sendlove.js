'use strict';

// const util = require('util');
// const _ = require('lodash');
const async = require('async');
// const validator = require('validator');
const request = require('request');
const cheerio = require('cheerio');
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);


/* *****************************************
  GET /api/intention/:id
  Retrieve a single intention
***************************************** */
exports.getIntention = (req, res, next) => {
  const token = req.params.token;
  const getUrl = `${process.env.API_URL}/thing/${token}`;
  var getPartsUrl = process.env.API_URL + '/part';
  const mapKey = process.env.GOOGLE_MAPS_KEY;
  var latitude;
  var longitude;
  var intention;
  var title = '';
  var imagePath = "http://sendloveio.imgix.net/";
  const shareUrl = "http://" + req.hostname + '/api/intention/' + token;
  var description;
  var shortDescription;
  // set up queryString
  var queryString = {};
  var queryStringParts = {}; // TODO slice out personID
  queryString['thingId'] = token;
  queryStringParts['thingId'] = token;
  var personId;
  var userName;
  var category;
  var updatedAt;
  var mapLocations;
  var commentsArray;
  var likesArray;
  var likesResult; // after removing zeros (liked and unliked)
  var likesCount = 0;

  // set personId
  if (req.user !== undefined) {
    // console.log("logged in, setting async");
    personId = req.user._id;
    personId = JSON.stringify(personId);
    personId = personId.replace(/"/g, ''); // HACK
    queryString.personId  = personId;
    // console.log(`personId = ${personId}`);
  } else {
    // console.log("not logged in, skipping personId");
  }
  // TODO use promises
  async.parallel({
    getIntention: (done) => {
      request.get({url: getUrl, json: true}, (err, req, body) => {
        if (err) {
          return (err, body); // this error propagates
        }
        if (req.statusCode !== 200) {
          req.flash('errors', {
            msg: `An error occured with status code ${req.statusCode}: ${req.body.message}`
          });
        }
        // set any variables
        let userEmail = req.body[0].person[0].email;
        delete  req.body[0].person[0].email;

        userName = req.body[0].person[0].profile.name;
        if (userName === undefined || userName === '') {
          userEmail = userEmail.split('@')[0];
          userName = userEmail;
        }
        // console.log(userName);
        imagePath += req.body[0].imagePath;
        description = req.body[0].description;
        category = req.body[0].category;
        updatedAt = req.body[0].updatedAt.toString().substring(0, 10);
        // console.log(description);
        try {
          shortDescription = req.body[0].description.substring(0,145) + "..";
        } catch (ex) {
          shortDescription = 'set your intention';
          console.error('inner', ex.message);
        }
        latitude = req.body[0].latitude;
        longitude = req.body[0].longitude;
        title += req.body[0].name;
        done(err, body);
      });
    },
    getLikes: (done) => {
      queryStringParts.partType = 'like';
      // console.log(`in getLikes: ${queryStringParts}`);
      request.get({url: getPartsUrl, qs: queryStringParts, json: true}, (err, req, body) => {
        if (err) {
          return next(err);
        } // todo fix next reference
        if (req.statusCode !== 200) {
          req.flash('errors', {
            msg: `An error occured with status code ${req.statusCode}: ${req.body.message}`
          });
        }
        // set any variables
        var likesArray = req.body;
        for (var like of likesArray) {
          if (!isNaN(like.nValue)) {
            likesCount += like.nValue; // just count them up
            if (likesCount < 0) {likesCount = 0};
          } else {
            likesArray.splice(like, 1); // remove the element
          }
        }
        // console.log(likesArray);
        // console.log(`likesCount = ${likesCount}`);
        done(err, body);
      });
    },
    getComments: (done) => {
      queryStringParts['partType'] = 'comment';
      // console.log(`in getComments: ${queryStringParts}`);
      request.get({url: getPartsUrl, qs: queryStringParts, json: true}, (err, req, body) => {
        if (err) {
          return next(err);
        } // todo fix next reference
        if (req.statusCode !== 200) {
          req.flash('errors', {
            msg: `An error occured with status code ${req.statusCode}: ${req.body.message}`
          });
        }
        // set any variables
        commentsArray = req.body;
        for (var i = 0; i < commentsArray.length; i++) {
          // fix updatedAt
          commentsArray[i].updatedAt = commentsArray[i].updatedAt.toString().substring(0,10)
          // add userName
          let userEmail = commentsArray[i].person[0].email;
          let userName = commentsArray[i].person[0].profile.name;
          delete commentsArray[i].person[0].email;


          if (userName === undefined || userName === '') {
            userEmail = userEmail.split('@')[0];
            userName = userEmail;
          }
          commentsArray[i].userName = userName;
          // console.log(commentsArray[i].updatedAt);
          // console.log(commentsArray[i].userName);
        }

        done(err, body);
      });
    }


  },
  (err, results) => {
    if (err) {
      return next(err);
    }

    // the array that is passed to client side javascript
    mapLocations = results.getIntention;

    res.render('api/intention', {
      title,
      description,
      shortDescription,
      latitude,
      longitude,
      mapKey,
      mapLocations: results.getIntention,
      imagePath,
      token,
      shareUrl,
      likesArray, // : results.getLikes, /* weirdly we can pass either because it's a byref assignment! */
      commentsArray, // : results.getComments,
      userName,
      category,
      updatedAt,
      likesCount,
      userLikes: 0 // HACK just create the variable here, it will be accessed in pug and modified by client JS
    });
  });
};


/* *****************************************
  GET /api/new_intention
  for posting a new intention
***************************************** */
exports.getNewIntention = (req, res) => {
  const latitude = 0;
  const longitude = 0;
  const shareUrl = `http:// ${req.hostname} /api/map`;

  res.render('api/new_intention', {
    title: 'New Intention',
    latitude,
    longitude,
    mapKey: process.env.GOOGLE_MAPS_KEY,
    shareUrl
  });
};

/* *****************************************
  POST /api/new_intention
  Create a new intention on api.sendlove.io and return it to the user
  multer has already uploaded the file. we get its file name, validate, then delete it if it's not or rename it.
***************************************** */
exports.postIntention = (req, res, next) => {


  var latitude = req.body.latitude;
  var longitude = req.body.longitude;

  var formData = {};

  var newImage;

  // console.log(util.inspect(req, false, null));

  /*
  valide the data entered by the user. TODO - go back and delete the image,
  or never upload it in the first place, if it's a bad file.
  */

  newImage = req.files[0].key;
  //var mimeTypeClaimed = req.files[0].mimetype.toString();
  var mimeTypeActual = req.files[0].contentType.toString(); // contentType is a metadata set in multerS3
  if (!mimeTypeActual.startsWith("image/")) {
    req.flash('errors', { msg: "Please upload an image of type GIF, JPG, or PNG :) " });
    return res.redirect('/api/new_intention');
  }
  var fileSize = req.files[0].size;
  if (fileSize > 10000000) {
    req.flash('errors', { msg: "Please upload an image smaller than 10 megs :) " });
    return res.redirect('/api/new_intention');
  }


  // TODO delete bad file USING AWS-SDK

  // check errors
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/new_intention');
  }
  if (isNaN(latitude) || isNaN(longitude)) {
    req.flash('success', { msg: "consider adding to the map :) " });
    formData = {
      name: req.body.name,
      description: req.body.description,
      personId: req.user._id,
      imagePath: newImage,
      category: req.body.category
    };
  } else {
    formData = {
      name: req.body.name,
      description: req.body.description,
      personId: req.user._id,
      latitude: Number(latitude),
      longitude: Number(longitude),
      imagePath: newImage,
      category: req.body.category
    };
  }

  // set API post url, and process form
  const postUrl = process.env.API_URL + '/thing';

  var jsonData = JSON.stringify(formData);
  console.log(formData);
  console.log(postUrl);
  request({
    url: postUrl,
    method: "POST",
    json: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: jsonData
    }
    ,(err, request, body) => {
      // `body` is a js object if request was successful
      if (err) {
        return next(err);
      }
      if (request.statusCode !== 200) {
        req.flash('errors', {
          msg: `An error occured with status code ${request.statusCode}: ${request.body.message}`
        });
        return res.redirect('/api/new_intention');
      }
      req.flash('success', { msg: 'Intention created!' });
      res.redirect('/api/intention/' + request.body._id);
    }
  );
};


/* *****************************************
  GET /api/map
  display the map
***************************************** */
 exports.getMap = (req, res, next) => {

  var getUrl = process.env.API_URL + '/thing';
  var latitude;
  var longitude;
  var mapKey;
  var mapLocations;
  var imagePath = "http://sendloveio.imgix.net/";
  var shareUrl = "http://" + req.hostname + '/api/map/'
  var title = 'Sendlove - Map'

  if (req.query.category != undefined) {
    getUrl += '/?category=' + req.query.category;
  }

  request({
    url: getUrl,
    method: "GET",
    json: true,
    headers: {
      "Content-Type": "application/json",
    }
    }

    ,(err, request, body) => {
      // `body` is a js object if request was successful
      if (err) {
        return next(err);
      }
      if (request.statusCode !== 200) {
        req.flash('errors', {
          msg: `An error occured with status code ${request.statusCode}: ${request.body.message}`
        });
      }
      mapLocations = request.body; // NB: this is how to query the sendlove.io api
      for(var i = 0; i < mapLocations.length; i++) {
        // delete mapLocations[i]['description'];
        mapLocations[i]['description'] = mapLocations[i]['description'].substring(0,255);
        // fix updatedAt
        mapLocations[i].updatedAt = mapLocations[i].updatedAt.toString().substring(0,10)
        // add userName
        let userEmail = mapLocations[i].person[0].email;
        let userName = mapLocations[i].person[0].profile.name;
        delete mapLocations[i].person[0].email;

        if (userName === undefined || userName === '') {
          userEmail = userEmail.split('@')[0];
          userName = userEmail;
        }
        mapLocations[i].userName = userName;
      }

      if (mapLocations.length > 0) {
        imagePath += mapLocations[mapLocations.length-1].imagePath;
      } else {
        imagePath += 'globe.gif';
      }

      res.render('api/map', {
        title,
        shortDescription: 'Set your intention today on SendLove.io.',
        latitude,
        longitude,
        mapKey: process.env.GOOGLE_MAPS_KEY,
        mapLocations,
        // TODO add a new "locatoins" object that just has attributes specifically used in the jquery
        imagePath, // + 'globe.gif',
        shareUrl
      });
    }
  );
}


/* *****************************************
  GET /api/feed
  display the feed
***************************************** */
 exports.getFeed = (req, res, next) => {

  var getUrl = process.env.API_URL + '/thing';
  var latitude;
  var longitude;
  var feedKey;
  var mapLocations;
  var imagePath = "http://sendloveio.imgix.net/";
  var shareUrl = "http://" + req.hostname + '/api/feed/';
  var title = "Sendlove - Health & Wellbeing Meditations";

  if (req.query.category != undefined) {
    getUrl += '/?category=' + req.query.category;
  }

  request({
    url: getUrl,
    method: "GET",
    json: true,
    headers: {
      "Content-Type": "application/json",
    }
    }

    ,(err, request, body) => {
      // `body` is a js object if request was successful
      if (err) {
        return next(err);
      }

      if (request.statusCode !== 200) {
        req.flash('errors', {
          msg: `An error occured with status code ${request.statusCode}: ${request.body.message}`
        });
      }
      mapLocations = request.body; // NB: this is how to query the sendlove.io api
      for (var i = 0; i < mapLocations.length; i++) {
        // delete mapLocations[i]['description'];
        mapLocations[i]['description'] = mapLocations[i]['description'].substring(0,255);
        // fix updatedAt
        mapLocations[i].updatedAt = mapLocations[i].updatedAt.toString().substring(0,10);
        // add userName
        let userEmail = mapLocations[i].person[0].email;
        let userName = mapLocations[i].person[0].profile.name;
        delete mapLocations[i].person[0].email;
        
        if (userName === undefined || userName === '') {
          userEmail = userEmail.split('@')[0];
          userName = userEmail;
        }
        mapLocations[i].userName = userName;
      }

      if (mapLocations.length > 0) {
        imagePath += mapLocations[mapLocations.length - 1].imagePath; // first imagePath, used for sharing
      } else {
        imagePath += 'globe.gif';
      }
      // console.log(mapLocations);

      res.render('api/feed', {
        title: title,
        shortDescription: 'Set your intention today on SendLove.io.',
        latitude,
        longitude,
        mapLocations,
        imagePath: imagePath, // + 'globe.gif',
        shareUrl: shareUrl
      });
    }
  );
}

/* *****************************************
  GET /api/message
  Send a message via SMS
***************************************** */
exports.getMessage = (req, res) => {
  res.render('api/message', {
    title: 'Message - SendLove.io',
    token: req.param('intention')
  });
}

/* *****************************************
  POST /api/message
  Create a new message and send it

***************************************** */
exports.postMessage = (req, res, next) => {
  req.assert('telephone', 'Phone number is required.').notEmpty();
  req.assert('message', 'Message cannot be blank.').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/message');
  }
  const token =req.body.token;
  var shareUrl = "http://" + req.hostname + '/api/intention/' + token; // TODO dynamically determine protocol, parameterize folder

  const message = {
    to: req.body.telephone,
    from: '+16233350027', // TODO - Allow multiple numbers to by dynamically set by business logic
    body: req.body.message + " - " + shareUrl
  };
  // todo MediaUrl, MessagingServiceSid

  twilio.sendMessage(message, (err, responseData) => {
    if (err) { return next(err.message); }
    req.flash('success', { msg: `Text sent to ${responseData.to}.` });
    res.redirect('/api/message');
  });
}

/* *****************************************
  GET /api/detail
  add a detail to an intention. NB: this page may not ever use get, only post.
***************************************** */
exports.getDetail = (req, res) => {
  res.render('api/detail', {
    title: 'detail - SendLove.io'
  });
}

/* *****************************************
  POST /api/detail
  Create a new detail on api.sendlove.io
  TODO redirect simply to the page that you came from(?)
***************************************** */
exports.postDetail = (req, res, next) => {
  // console.log(req.body);
  var thingId = req.body.thingId;
  var personId = req.body.personId;
  var partType = req.body.partType;
  var description = req.body.description;
  var nValue = req.body.nValue;

  console.log(`posting  ${partType} detail for thingId ${thingId} and  personId ${personId}`);
  // check errors
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    res.redirect('/api/intention/' + thingId);
    //return res.send();
  }
  // set API post url, and process form
  const postUrl = process.env.API_URL + '/part'
  if (partType == 'comment') {
    var formData = {
      thingId,
      personId: req.user._id,
      partType,
      description
    }
  } else { // default to 'like'
    var formData = {
      thingId,
      personId: req.user._id,
      partType,
      nValue: parseInt(nValue, 10) // convert to number for API
    }
  }
  var jsonData = JSON.stringify(formData);
  // console.log(formData);
  // console.log(jsonData);
  request({
    url: postUrl,
    method: "POST",
    json: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: jsonData
    }
    , (err, request, body) => {
      // `body` is a js object if request was successful
      if (err) {
        return next(err);
      }
      if (request.statusCode !== 200) {
        req.flash('errors', {
          msg: `An error occured with status code ${request.statusCode}: ${request.body.message}`
        });
        // TODO pass json error msg from api?
        res.redirect('/api/intention/' + thingId);
        //return res.send();
      }
      if (req.body.partType == 'comment') {
        res.redirect('/api/intention/' + thingId);
      } else {
        return res.send();
      }
    }
  );
};


/* *****************************************
  GET /api/goodnews
  Web scraping example using Cheerio library.
***************************************** */
exports.getGoodNews = (req, res, next) => {
  const links = [];
  const links_hp = [];
  const links_gn = []
  async.parallel(
    {
      getReddit: (done) => {
        request.get('https://www.reddit.com/r/UpliftingNews/', (err, request, body) => {
          const $ = cheerio.load(body);

          $('.title a[href^="http"]').each((index, element) => {
            links.push($(element));
          });
          done(err, links);
        });
      },
      getHP: (done) => {
        request.get('http://www.huffingtonpost.com/section/good-news', (err, request, body) => {
          const $ = cheerio.load(body);

          $('.card__headlines a[href^="http"]').each((index, element) => {
            links_hp.push($(element));
          });
          done(err, links_hp);
        });
      },
      getGN: (done) => {
        request.get('http://www.goodnewsnetwork.org/', (err, request, body) => {
          const $ = cheerio.load(body);

          $('.entry-title a[href^="http"]').each((index, element) => {
            links_gn.push($(element));
          });
          done(err, links_gn);
        });
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render('api/goodnews', {
        title: 'Good News',
        links: results.getReddit,
        links_hp: results.getHP,
        links_gn: results.getGN
      });
    }
  );
};

/* *****************************************
  GET /api/testmap
  this is the dynamic version
***************************************** */
exports.getTestMap = (req, res, next) => {
  console.log('test page');
}


/* *****************************************
  POST /api/testmap
  test posting
***************************************** */
exports.postTestMap = (req, res) => {
  res.redirect('/api/testmap');
};
