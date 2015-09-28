var express = require('express');
var router = express.Router();

router.get("/", function(req,res){
  if(req.sess.count){
    req.sess.count = req.sess.count + 1;
  }else{
    req.sess.count = 1;
  }
  res.send("Count:" + req.sess.count);
});

module.exports = router;