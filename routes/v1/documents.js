var express = require('express');
var sanitizeHtml = require('sanitize-html');
var router = express.Router();

router.post("/new", function(req,res){
  var db = req.db;
  var documents = req.db.collection('documents');
  var newdoc = {};
  newdoc.title = sanitizeHtml(req.body.title, {
    allowedTags: [],
    allowedAttributes: []}
  );
  newdoc.location = "";
  newdoc.content = "";
  newdoc.type = req.body.type || "text/rich-html-note";
  newdoc.author = req.user;
  newdoc.owner = req.user;
  newdoc.tags = [];
  newdoc.dateupdated = new Date();
  newdoc.datecreated = new Date();
  documents.insert(newdoc, function(err, doc) {
    if(err){
      console.log(err);
      res.json({status: "error", messsage: "Error adding page. \n"+err})
    }else{
      res.json({status: "success"});
    }
  });
});

router.get("/my", function(req,res){
  var db = req.db;
  var documents = req.db.collection('documents');
  documents.find({owner: req.user}, {title: true, dateupdated: true, tags: true, type: true}).toArray(function(err, docs) {
    if(err){
      console.log(err);
      res.json({status: "error", messsage: "Error occured. \n"+err})
    }else{
      res.json({status: "success", data: docs});
    }
  });
});

router.post("/read", function(req,res){
  var db = req.db;
  var documents = req.db.collection('documents');
  documents.findOne({owner: req.user, _id: req.ObjectId(req.body.id)},function(err, doc) {
    if(err){
      console.log(err);
      res.json({status: "error", messsage: "Error occured. \n"+err});
    }else if(!doc){
      res.json({status: "error", messsage: "Error occured. \nNo document found."});
    }else{
      res.json({status: "success", data: doc});
    }
  });
});

router.post("/update", function(req,res){
  var db = req.db;
  var documents = req.db.collection('documents');
  documents.update({owner: req.user, _id: req.ObjectId(req.body.id)}, {
    $set:{
      title:   req.body.title,
      content: req.body.content,
      dateupdated: new Date()
    }
  },{upsert:false, multi:false, w:1},function(err, doc) {
    if(err){
      console.log(err);
      res.json({status: "error", messsage: "Error occured. \n"+err});
    }else if(!doc){
      res.json({status: "error", messsage: "Error occured. \nNo document found."});
    }else{
      if(req.body.r){
        res.redirect("/"+req.body.r);
      }else{
        res.json({status: "success"});
      }
    }
  });
});

router.post("/delete", function(req,res){
  var db = req.db;
  var documents = req.db.collection('documents');
  documents.remove({owner: req.user, _id: req.ObjectId(req.body.id)},function(err, result) {
    if(err){
      console.log(err);
      res.json({status: "error", messsage: "Error occured. \n"+err})
    }else{
      res.json({status: "success",message: "Object deleted"});
    }
  });
});

module.exports = router;