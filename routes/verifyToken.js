const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
   const JWTtoken = req.header('auth-token');
   if (!JWTtoken) return res.status(401).send('Access Denied, no JWTtoken in header');

   try {
      const verified = jwt.verify(JWTtoken, process.env.TOKEN_SECRET);
      req.user = verified;
      next();
   } catch (err) {
      console.log('Invalid Token, need to login again');
      return res.send({
         success: false,
         message: 'Error: Invalid Token',
      });
   }
};