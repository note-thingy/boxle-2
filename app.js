var express = require("express");
var harp = require("harp");
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var connectMongoStore = require('connect-mongo')(session);
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore-bcrypt-node');
var email   = require("emailjs");
var app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));
app.use(harp.mount(__dirname + "/public"));

/* MONGODB SETUP */
// DOCS ARE HERE https://github.com/mongodb/node-mongodb-native/blob/master/Readme.md
app.use(function (req, res, next){
 MongoClient.connect(process.env.DBURL, function(err, db) {
   if(err) throw err;
   req.db = db;
   req.ObjectId = mongodb.ObjectID;
   next();
 });
});
app.use(session({
  secret: 'keyboard cat',
  store:  new connectMongoStore({ url: process.env.DBURL })
}));
app.use(function(req,res,next){
  req.sess = req.session;
  next()
})
/* END MONGODB SETUP */

//START X-Clacks-Overhead
app.use(function(req,res,next){
	res.setHeader('X-Clacks-Overhead', 'GNU Terry Pratchett');
	next();
});
//END   X-Clacks-Overhead

//START PASSWORDLESS
var smtpServer  = email.server.connect({
   user:    process.env.EMAILUSER, 
   password: process.env.EMAILPASS, 
   host:    process.env.EMAILHOST, 
   ssl:     true
});

// MongoDB TokenStore
passwordless.init(new MongoStore(process.env.DBURL));

// Set up a delivery service
passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
        var host = process.env.HOST;
        smtpServer.send({
            text:    'Hello!\nAccess your account here: ' 
            + host + '/accept?token=' + tokenToSend + '&uid=' 
            + encodeURIComponent(uidToSend), 
            from:    process.env.EMAILUSER, 
            to:      recipient,
            subject: 'Login token for ' + host
        }, function(err, message) { 
            if(err) {
                console.log(err);
            }
            callback(err);
        });
});

app.use(passwordless.sessionSupport());
app.use("/accept", passwordless.acceptToken({ successRedirect: '/accepted'}),
  function(req,res){
    res.send("Accept failure")
});

/* GET login screen. */
/*app.get('/login', function(req, res) {
   res.r('login');
});*/

/* POST login details. */
app.post('/sendtoken', 
    passwordless.requestToken(
        // Turn the email address into an user ID
        function(user, delivery, callback, req) {
            // usually you would want something like:
           /* User.find({email: user}, callback(ret) {
               if(ret)
                  callback(null, ret.id)
               else
                  callback(null, null)
          })*/
          var db = req.db;
          var users = req.db.collection('users');
          users.findOne({ email: user },function(err, doc) {
            if(doc){
              console.log(JSON.stringify(doc));
              callback(null, JSON.stringify(doc));
            }else{
              users.insert({email: user}, function(err, doc) {
                if(err){
                  console.log(err);
                  res.send("Error adding user. \n"+err);  
                }else{
                  console.log(JSON.stringify(doc));
                  callback(null, JSON.stringify(doc));
                }
              });
            }
          });
          // but you could also do the following 
          // if you want to allow anyone:
          // callback(null, user);
        }),
    function(req, res) {
       // success!
          res.redirect('/sent');
});

app.get("/logout", passwordless.logout(),
  function(req,res){
    res.redirect("/loggedout")
});
//END   PASSWORDLESS

/* GET restricted site. */
app.get('/restricted', passwordless.restricted(),
 function(req, res) {
  res.send("Hey " + req.user + ". You are logged in.");
});

// route as normal
app.use("/api/v1/documents", passwordless.restricted(), require("./routes/v1/documents"));

app.get('/api/v1/me', passwordless.restricted(),
 function(req, res) {
  //console.log(req.user);
  res.json(JSON.parse(req.user));
});
// end routes

app.listen(process.env.PORT||3000);
