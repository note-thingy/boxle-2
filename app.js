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
var app = express();

/* MONGODB SETUP */
// DOCS ARE HERE https://github.com/mongodb/node-mongodb-native/blob/master/Readme.md
if(process.env.DBURL){
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
}else{
app.use(session({
  secret: 'keyboard cat'
}));
}
/* END MONGODB SETUP */

//START X-Clacks-Overhead
app.use(function(req,res,next){
	res.setHeader('X-Clacks-Overhead', 'GNU Terry Pratchett');
	next();
});
//END   X-Clacks-Overhead

app.use(function(req,res,next){
  req.sess = req.session;
  next()
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));
app.use(harp.mount(__dirname + "/public"));

// route as normal
app.use("/api/sesscount-v1", require("./routes/sesscount-v1"));
// end routes

app.listen(process.env.PORT||3000);
