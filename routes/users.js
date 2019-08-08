var express = require("express");
var router = express.Router();

let globalUsers = [
  { username: "admin", password: "admin" },
  { username: "kai", password: "test" },
  { username: "barak", password: "testt" }
];

const checkValidity = (userName, passWord)=> {
  let exists = false;
  let correctUser = {};
  globalUsers.forEach(user => {
    if (user.username === userName && user.password === passWord) {
      correctUser = user;
      exists = true;
    }
  });
  return (exists ? correctUser : exists);
};


/* GET users listing. */
router.get("/login/:username/:password", function(req, res, next) {
  console.log(req.params.username + " " + req.params.password);
  res.json(checkValidity(req.params.username, req.params.password));

});


module.exports = router;