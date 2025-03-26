var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/loginForm', function(req, res, next) {
  res.render('loginForm', { title: 'Express' });
});

router.get('/signupForm', function(req, res, next) {
  res.render('signupForm', { title: 'Express' });
});

router.get('/insertForm', function(req, res, next) {
  res.render('insertForm', { title: 'Express' });
});

router.get('/pageServiceForm', function(req, res, next) {
  res.render('pageServiceForm', { title: 'Express' });
});

router.get('/pageContactForm', function(req, res, next) {
  res.render('pageContactForm', { title: 'Express' });
});

router.get('/confirmPaymentForm', function(req, res, next) {
  res.render('confirmPaymentForm');
});


module.exports = router;
