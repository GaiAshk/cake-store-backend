const express = require("express");
const app = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const dotenv = require('dotenv');
const verify = require('./verifyToken');

//allowed access to .env file
dotenv.config();

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
    const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    console.log(date);

    newUser.username = username;
    newUser.password = newUser.generateHash(password);
    newUser.date = date;

    newUser.save((err, user) => {
      if(err){
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      console.log("User Sign Up Complete");
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
        message: 'Error: this username does not exist, you must register before log in',
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

    //create and assign a token from jwt that expires in 5 minutes
    const JWTtoken = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, {expiresIn: 60});


    const userSession = new UserSession();
    userSession.userId = user._id;
    userSession.userName = user.username;
    userSession.save((err, doc) => {
      if(err){
        return res.send({
          success: false,
          message: 'Error: server error',
        })
      }
      console.log("User Sign In Complete");
      return res.header('auth-token', JWTtoken).send({
        success: true,
        message: 'Valid sign in',
        token: doc._id,
        JWTtoken: JWTtoken,
        userId: doc.userId,
      })
    })

  })
});

//**//   verify //**//
app.get('/verify', verify, (req, res, next) => {
  //Get the token
  const {query} = req;
  const {token} = query;

  //verify the token is one of a kind and if it is update isDeleted in DB
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
        message: 'Error: Invalid Token',
      });
    } else {
      //create and assign a token from jwt that expires in 5 minutes, 300 seconds
      const JWTtoken = jwt.sign({_id: token}, process.env.TOKEN_SECRET, {expiresIn: 300});

      return res.send({
        success: true,
        message: 'Verified, JWTtoken updated',
        JWTtoken: JWTtoken,
      });
    }
  })
});

//**//   log out //**//
app.get('/logout', (req, res, next) => {
  //Get the token
  const {query} = req;
  const {token} = query;

  //verify the token is one of a kin
  UserSession.findOneAndUpdate({
    _id: token,
    isDeleted: false,
  },
  {$set: {isDeleted: true} },
  {new: true}, (err, sessions) => {
    if(err) {
      return res.send({
        success: false,
        message: 'Error: Server Error, could not log out',
      });
    }

    console.log("User Sign Out Complete");
    return res.send({
      success: true,
      message: 'Logged Out',
    });
  })
});

// ** // updateing database for tracking customers // ** //
// update cart of users
app.post('/updatecart', (req, res, next) => {
  const {body, query} = req;
  const {cart} = body;
  const {token} = query;

  //verify the token is one of a kind and update cart in DB
  UserSession.findOneAndUpdate({
       _id: token,
     },
     {$set: {cart: cart}}
     , {new: true}, (err, sessions) => {
       if(err) {
         return res.send({
           success: false,
           message: 'Error: Server Error, could not update cart',
         });
       }

       console.log("cart updated");
       return res.send({
         success: true,
         message: 'Cart updated in DB',
       });
     })
});

//update My Recipes
app.post('/myrecipe', (req, res, next) => {
  const {body, query} = req;
  const {myRecipes} = body;
  const {token} = query;

  //verify the token is one of a kind and update cart in DB
  UserSession.findOneAndUpdate({
       _id: token,
     },
     {$set: {myRecipes: myRecipes}}
     , {new: true}, (err, sessions) => {
       if(err) {
         return res.send({
           success: false,
           message: 'Error: Server Error, could not update My Recipes',
         });
       }

       console.log("My Recipes updated");
       return res.send({
         success: true,
         message: 'My Recipes updated in DB',
       });
     })
});

//update recipe searches
app.post('/searches', (req, res, next) => {
  const {body, query} = req;
  const {searches} = body;
  const {token} = query;

  console.log(searches);

  //verify the token is one of a kind and update cart in DB
  UserSession.findOneAndUpdate({
       _id: token,
     },
     {$set: {searches: searches}}
     , {new: true}, (err, sessions) => {
       if(err) {
         return res.send({
           success: false,
           message: 'Error: Server Error, could not update searches',
         });
       }

       console.log("searches updated");
       return res.send({
         success: true,
         message: 'Searches updated in DB',
       });
     })
});

//get all data from DB
app.get('/alldata', (req, res, next) => {
   const {query} = req;
   const {filter} = query;

   UserSession.find({}, (err, sessions) => {
         if(err) {
            return res.send({
               success: false,
               message: 'Error: Server Error, could not fetch all the data from the DB',
            });
         }

         console.log("fetched all the data from DB for the Admin");
         return res.send(sessions);
      })
});

module.exports = app;