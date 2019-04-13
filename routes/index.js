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

	router.get('/marginal_loss_factors', function(req, res, next) {
		res.render('marginal_loss_factors')
	})

	// Collect Data

	run_map_ref_builder = true
	var grid_map_ref_server = {}
	var grid_map_ref_browser = {}

	if (run_map_ref_builder) {
		var map_ref_builder = require('./map_ref_builder.js')
		map_ref_builder( function (server_data,browser_data) {
			grid_map_ref_server = server_data
			grid_map_ref_browser = browser_data
		})
	} else {
		grid_map_ref_server = require('../data/grid_map_ref_server.json')
		grid_map_ref_browser = require('../data/grid_map_ref_browser.json')
	}

	// Send Browser Map Info

	router.post('/marginal_loss_factor_data', function(req, res, next) {
	  	res.send(grid_map_ref_browser)
	})

	// Send Inspection Data

	router.post('/marginal_loss_factor_inspection', function(req, res, next) {
		if (req.body.type == 't') {
			for (transmission_line=0;transmission_line<grid_map_ref_server.transmission.length;transmission_line++) {
			  	if (grid_map_ref_server.transmission[transmission_line].id == req.body.id) {
			  		res.send(grid_map_ref_server.transmission[transmission_line].properties.description)
			  	}
	  		}
		}
	})

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
