var express = require('express');
var router = express.Router();

var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

/* GET Categories listing. */
router.get('/add', function(req, res, next) {
    res.render('addcategory',{
      'title': 'Add Category',
    });
});


router.get('/show/:category', function(req, res, next) {
  var posts = db.get('posts');

  posts.find({category: req.params.category},{}, function(err, posts){
    res.render('index',{
      'title': req.params.category,
      'posts': posts
    });
  });
});

/* Category Post. */
router.post('/add', function(req, res, next) {

// get the form values
  var name = req.body.name;

  // Form Validation
  req.checkBody('name', 'Name field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
    res.render('addcategory',{
      'errors': errors,
    });
  } else {
    var categories = db.get('categories');
    categories.insert({
      'name': name,
    }, function(err, post){
      if(err){
        res.send(err);
      } else {
        req.flash('success', 'Category Added');
        res.location('/');
        res.redirect('/');
      }
    });
  }
});





module.exports = router;
