var express = require("express");
var app = express.Router();
const User = require('../models/User');
const UserSession = require('../models/UserSession');

//helper function to check valid username and password
searchUserPass = (username, password) => {
  let flag = false;
  [...username].forEach(c => {
    if (((c >= '0') && (c <= '9') ) || ((c >= 'a') && (c <= 'z') ) || ((c >= 'A') && (c <= 'Z'))){
    } else {
      flag = true
    }
  });
  [...password].forEach(c => {
    if (((c >= '0') && (c <= '9') ) || ((c >= 'a') && (c <= 'z') ) || ((c >= 'A') && (c <= 'Z'))){
    } else {
      flag = true
    }
  });
  return flag;
};

//**// sign up (register) //**//
app.post('/signup', (req, res, next) => {
  const {body} = req;
  const {username, password} = body;
  if (!username) {
    return res.send({
      success: false,
      message: 'Error: Username cannot be blank.',
    });
  }
  if (!password) {
    return res.send({
      success: false,
      message: 'Error: Password cannot be blank.',
    });
  }

  if (username.length < 4 || username.length > 12 || password.length < 4 || password.length > 12 || searchUserPass(username, password)){
    return res.send({
      success: false,
      message: 'Error: Password and username must be 4-12 characters and contain only letters and numbers.',
    });
  }

  //verify username doesnt exist and save user
  User.find({
    username: username
  }, (err, previousUsers) => {
    if(err) {
      return res.send({
        success: false,
        message: 'Error: Server error',
      });
    } else if (previousUsers.length > 0){
      return res.send({
        success: false,
        message: 'Error: Account already exist with this username.',
      });
    }

    //save the new user
    const newUser = new User();

    newUser.username = username;
    newUser.password = newUser.generateHash(password);
    newUser.save((err, user) => {
      if(err){
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      return res.send({
        success: true,
        message: 'Signed Up',
        token: newUser.password,
      });
    });
  });
});

//**//   Log in   //**//
app.post('/signin', (req, res, next) => {
  const {body} = req;
  const {username, password} = body;
  if (!username) {
    return res.send({
      success: false,
      message: 'Error: Username cannot be blank.',
    });
  }
  if (!password) {
    return res.send({
      success: false,
      message: 'Error: Password cannot be blank.',
    });
  }

  //verify username and password
  User.find({
    username: username
  }, (err, users) => {
    if(err){
      return res.send({
        success: false,
        message: 'Error: server error',
      })
    }
    if (users.length !== 1){
      return res.send({
        success: false,
        message: 'Error: Invalid username',
      })
    }

    //user[0] is json holding username, hashed password, isDeleted and also token _id
    const user = users[0];

    if (!user.validPassword(password)){
      return res.send({
        success: false,
        message: 'Error: Invalid password',
      })
    }

    // otherwise we have a correct user
    //enter user session

    const userSession = new UserSession();
    userSession.userId = user._id;
    userSession.save((err, doc) => {
      if(err){
        return res.send({
          success: false,
          message: 'Error: server error',
        })
      }

      return res.send({
        success: true,
        message: 'Valid sign in',
        token: doc._id,
      })
    })

  })
});

//**//   verify //**//
app.get('/verify', (req, res, next) => {
  //Get the token
  const {query} = req;
  const {token} = query;

  //verify the token is one of a kind and it is
  UserSession.find({
    _id: token,
    isDeleted: false,
  }, (err, sessions) => {
    if(err) {
      return res.send({
        success: false,
        message: 'Error: Invalid',
    });
  }
    if(sessions.length != 1){
      return res.send({
        success: false,
        message: 'Error: Invalid',
      });
    } else {
      return res.send({
        success: true,
        message: 'Verified',
      });
    }

  })
});

//**//   log out //**//
app.get('/logout', (req, res, next) => {
  //Get the token
  const {query} = req;
  const {token} = query;

  //verify the token is one of a kind and it is
  UserSession.findOneAndUpdate({
    _id: token,
    isDeleted: false,
  },
  {$set: {isDeleted: true}}
  , null,  (err, sessions) => {
    if(err) {
      return res.send({
        success: false,
        message: 'Error: Server Error',
      });
    }

      return res.send({
        success: true,
        message: 'Verified',
      });
  })
});


module.exports = app;