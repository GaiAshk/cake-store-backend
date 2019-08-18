fetch = require('node-fetch');

async function test(){


   // register 3 users and print their unique usernames, other test are not successful, errors are specified in comments

   console.log("testing registration :");


   let user0 = await register("user00", "user00");
   //should print "Signed Up"
   console.log(user0.message);
   let user1 = await register("user01", "user01");
   //should print "Signed Up"
   console.log(user1.message);
   let user2 = await register("user02", "user02");
   //should print "Signed Up"
   console.log(user2.message);
   let user3 = await register("admin", "admin");
   // should print "Error: Account already exist with this username".
   console.log(user3.message);
   let user4 = await register("", "admin");
   //should print "Error: Username cannot be blank."
   console.log(user4.message);
   let user5 = await register("adm;in", "adm&&&&in");
   //should print "Error: Password and username must be 4-12 characters and contain only letters and numbers."
   console.log(user5.message);

   //login for the users that registered
   console.log("");
   console.log("testing log in :");


   user0 = await login("user00", "user00");
   //Should print "Valid sign in"
   console.log(user0.message);
   user1 = await login("user01", "user01");
   //Should print "Valid sign in"
   console.log(user1.message);
   user2 = await login("user02", "user02");
   //Should print "Valid sign in"
   console.log(user2.message);
   user3 = await login("admin", "admin");
   //Should print "Valid sign in"
   console.log(user3.message);
   user4 = await login("", "admin");
   //Should print "Error: Username cannot be blank."
   console.log(user4.message);
   user5 = await login("hello", "world");
   //Should print "Error: this username does not exist, you must register before log in"
   console.log(user5.message);

   //save all the tokens for future use
   const token0 = user0.token;
   const token1 = user1.token;
   const token2 = user2.token;
   const token3 = user3.token;

   //save some userId's for admin test
   const adminToken = user3.userId;
   const userToken = user0.userId;

   //verify users and update their cookies

   console.log("");
   console.log("testing verification :");


   user0 = await verify(user0.token, user0.JWTtoken);
   //Should print "Verified, JWTtoken updated"
   console.log(user0.message);
   user1 = await verify(user1.token, user1.JWTtoken);
   //Should print "Verified, JWTtoken updated"
   console.log(user1.message);
   user2 = await verify(user2.token, user2.JWTtoken);
   //Should print "Verified, JWTtoken updated"
   console.log(user2.message);
   user3 = await verify(user3.token, user3.JWTtoken);
   //Should print "Verified, JWTtoken updated"
   console.log(user3.message);
   user4 = await verify(user4.token, user4.JWTtoken);
   //Should print "Error: Invalid Token"
   console.log(user4.message);
   user5 = await verify(user5.token, '');
   //Should print "Access Denied, no JWTtoken in header"
   console.log(user5.message);



   // testing updating the DB with the users shopping

   //update cart in DB

   console.log("");
   console.log("Testing update cart :");

   user0 = await cart(token0, [{products: [1,2,3,4]}]);
   //Should print "Cart updated in DB"
   console.log(user0.message);
   user1 = await cart(token1,[{products: [1,2,3,4]}]);
   //Should print "Cart updated in DB"
   console.log(user1.message);
   user2 = await cart(token2, [{products: [1,2,3,4]}]);
   //Should print "Cart updated in DB"
   console.log(user2.message);
   user3 = await cart(token3, [{products: [1,2,3,4]}]);
   //Should print "Cart updated in DB"
   console.log(user3.message);
   user4 = await cart(11111, [{products: [1,2,3,4]}]);
   //Should print "Error: Server Error, could not update cart"
   console.log(user4.message);
   user5 = await cart(token1,[{products: [1,2,3,4]}] );
   //Should print "Cart updated in DB"
   console.log(user5.message);


   //update recipes in DB

   console.log("");
   console.log("Testing update recipes :");

   user0 = await recipe(token0, ["cake"]);
   //Should print "My Recipes updated in DB"
   console.log(user0.message);
   user1 = await recipe(token1,["cookies"]);
   //Should print "My Recipes updated in DB"
   console.log(user1.message);
   user2 = await recipe(token2, ["Ham"]);
   //Should print "My Recipes updated in DB"
   console.log(user2.message);
   user3 = await recipe(token3, ["Bacon"]);
   //Should print "My Recipes updated in DB"
   console.log(user3.message);
   user4 = await recipe(11111, ["yammy"]);
   //Should print "Error: Server Error, could not update My Recipes"
   console.log(user4.message);
   user5 = await recipe(12, null);
   //Should print "Error: Server Error, could not update My Recipes"
   console.log(user5.message);


   //update searches in DB

   console.log("");
   console.log("Testing update searches :");

   user0 = await search(token0, ["cake"]);
   //Should print "Searches updated in DB"
   console.log(user0.message);
   user1 = await search(token1,["cookies"]);
   //Should print "Searches updated in DB"
   console.log(user1.message);
   user2 = await search(token2, ["Ham"]);
   //Should print "Searches updated in DB"
   console.log(user2.message);
   user3 = await search(token3, ["Bacon"]);
   //Should print "Searches updated in DB"
   console.log(user3.message);
   user4 = await search(11111, ["yammy"]);
   //Should print "Error: Server Error, could not update searches"
   console.log(user4.message);
   user5 = await search(12, null);
   //Should print "Error: Server Error, could not update searches"
   console.log(user5.message);

   //test bringing the DB to the admin screen
   //only admin has access to the screen so only he can be tested

   console.log("");
   console.log("Testing Admin screen :");

   user3 = await admin(adminToken);
   //Should print "fetched all the data from DB for the Admin"
   console.log(user3.message);
   user4 = await admin(null);
   //Should print "Error: only admin can request this data"
   console.log(user4.message);
   user5 = await admin(userToken);
   //Should print "Error: only admin can request this data"
   console.log(user4.message);


   //log out

   console.log("");
   console.log("testing log out :");

   user0 = await logout(token0);
   //Should print "Logged Out"
   console.log(user0.message);
   user1 = await logout(token1);
   //Should print "Logged Out"
   console.log(user1.message);
   user2 = await logout(token2);
   //Should print "Logged Out"
   console.log(user2.message);
   user3 = await logout(token3);
   //Should print "Logged Out"
   console.log(user3.message);
   user4 = await logout(token0);
   //Should print "Logged Out"  // no problem to log out if you are logged out this should not be an error
   console.log(user4.message);
   user5 = await logout();
   //Should print "Error: Could not log out"
   console.log(user5.message);



}

async function register(username, password) {
   return (fetch("http://localhost:3001/users/signup/", { method: "POST", headers: {'Content-Type': 'application/json',
         'Accept': 'application/json'}, body: JSON.stringify({
            username: username,
            password: password,
         })
         }).then(res => res.json()))
}

async function login(username, password) {
   return (fetch("http://localhost:3001/users/signin/", { method: "POST", headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({
         username: username,
         password: password,
      }),
   }).then(res => res.json()));
}

async function verify(token, JWTtoken) {
   return (fetch("http://localhost:3001/users/verify?token=" + token, {method: 'GET', headers:{'auth-token': JWTtoken}})
      .then(res => res.json()));
}

async function logout(token) {
   return (fetch("http://localhost:3001/users/logout?token=" + token, { method: "GET"}
   ).then(res => res.json()))
}

async function cart(token, cart) {
   return (fetch("http://localhost:3001/users/updatecart?token=" + token, {
         method: "POST", headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
         body: JSON.stringify({
            cart: cart,
         })
      }).then(res => res.json()))
}

async function recipe(token, recipes) {
   return (fetch("http://localhost:3001/users/myrecipe?token=" + token, {
         method: "POST", headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
         body: JSON.stringify({
            myRecipes: recipes,
         })
      }
   ).then(res => res.json()))
}


async function search(token, searches) {
   return (fetch("http://localhost:3001/users/searches?token=" + token, {
         method: "POST", headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
         body: JSON.stringify({
            searches: searches,
         })
      }
   ).then(res => res.json()));
}

async function admin(token) {
   return (fetch("http://localhost:3001/users/alldata?token=" + token, {method: 'GET', headers:{'Content-Type': 'application/json'}})
      .then(res => res.json()))
}

test();