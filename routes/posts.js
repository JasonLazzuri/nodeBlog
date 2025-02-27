var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './public/images' })
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

/* Show individual blog */
router.get('/show/:id', function(req, res, next) {
  var posts = db.get('posts');

  posts.findById(req.params.id, function(err, post){
    res.render('show',{
      'post': post
    });
  });
});

/* GET Posts listing. */
router.get('/add', function(req, res, next) {
  var categories = db.get('categories');
  categories.find({},{}, function(err, categories){
    res.render('addpost',{
      'title': 'Add Post',
      'categories': categories
    });
  });
});



/* Post for Posts listing. */
router.post('/add', upload.single('mainimage'), function(req, res, next) {
// get the form values

  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date();

// check image upload
  if(req.file){
    var mainimage = req.file.filename
  } else{
    var mainimage = 'noimage.jpg';
  }

  // Form Validation
  req.checkBody('title', 'Title field is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
    res.render('addpost',{
      'errors': errors,
    });
  } else {
    var posts = db.get('posts');
    posts.insert({
      'title': title,
      'body': body,
      'category': category,
      'date': date,
      'author': author,
      'mainimage': mainimage
    }, function(err, post){
      if(err){
        res.send(err);
      } else {
        req.flash('success', 'Post Added');
        res.location('/');
        res.redirect('/');
      }
    });
  }
});

/* Post Posts listing. */
router.post('/addcomment', function(req, res, next) {

  var name = req.body.name;
  var email = req.body.email;
  var body = req.body.body;
  var postid = req.body.postid;
  var commentdate = new Date();

  // Form Validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required, but never displayed').notEmpty();
  req.checkBody('email', 'Email is not formatted properly').isEmail();
  req.checkBody('body', 'Body field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
    var posts = db.get('posts');
    posts.findById(postid, function(err, post){
      res.render('show',{
        'errors': errors,
        'post': post
      });
    });
  } else {
    var comment = {
      'name': name,
      'email': email,
      'body': body,
      'commentdate': commentdate
    }
    var posts = db.get('posts');

    posts.update({
      '_id':postid
    },{
      $push:{
        'comments':comment
      }
    },function(err, doc){
        if(err){
          throw err;
        } else{
          req.flash('success', 'Comment Added');
          res.location('/posts/show/'+ postid);
          res.redirect('/posts/show/'+ postid);
        }
    });
  }
});





module.exports = router;
