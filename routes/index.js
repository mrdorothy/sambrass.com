var express = require('express');
var router = express.Router();
var db = require("../db.js");
var log = require('../helpers/log.js');
var moment = require(`moment`)

// index

router.get('/', function(req, res, next) {
  res.render('index');
});

// marginal_loss_factors

var mlf_overlay = require('./marginal_loss_factors.js')
grid_overlay = mlf_overlay()

router.get('/marginal_loss_factors', function(req, res, next) {
  res.render('marginal_loss_factors');
});

router.post('/marginal_loss_factor_data', function(req, res, next) {
  res.send(grid_overlay);
});

// generators

/*

router.get('/grid', function(req, res, next) {
  res.render('grid');
});

router.post('/get_grid_data', function(req, res, next) {
	db.query(`
        SELECT 
            MAX(timestamp)
        FROM
            generation;
       	`)
        .then(max_timestamp => {
        	lower_timestamp = moment(max_timestamp[0].max).subtract(1, "days");
        	db.query(`
				SELECT 
					timestamp, sum(output) as output 
				FROM 
					generation 
				WHERE 
					timestamp>$1
				GROUP BY 
					timestamp 
				ORDER BY 
					timestamp;
				`, [lower_timestamp])
				.then(recent_generation => {
		        	res.send(recent_generation);
		        })
		        .catch(err => {
		            log(`There was some issue querying the generation db whilst getting the max timestamp.`, `e`)
		            console.log(err)
		            res.send('server_error');
		        })
        })
        .catch(err => {
            log(`There was some issue querying the generation db whilst getting the max timestamp.`, `e`)
            console.log(err)
            res.send('server_error');
        })    
})

*/

module.exports = router;
