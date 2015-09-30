var express = require('express');
var router = express.Router();
router.get("/", function(req,res){
  var db = req.db;
  var documents = req.db.collection('documents');
  var newdoc = {};
  newpage.title = req.body.title;
  newpage.location = "";
  newpage.content = req.body.content;
  newpage.dateupdated = new Date();
  newpage.datecreated = new Date();
  documents.insert(newdoc, function(err, doc) {
    if(err){
      console.log(err);
      res.send("Error adding page. \n"+err)
    }else{
      res.redirect("/admin/pages?action=added");
    }
  });
});

module.exports = router;