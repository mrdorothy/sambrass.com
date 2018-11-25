var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/global_emissions', function(req, res, next) {
  res.render('global_emissions');
});

module.exports = router;
