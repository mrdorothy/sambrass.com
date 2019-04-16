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

	var marginal_loss_factor_helpers = require('../helpers/marginal_loss_factor_helpers.js');

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
		
		var inspection_object=[]

		if (req.body.type == 't') {
			inspection_object = grid_map_ref_server.transmission
		} else if (req.body.type == 'e') {
			inspection_object = grid_map_ref_server.elec_station
		} else if (req.body.type == 'g') {
			inspection_object = grid_map_ref_server.generator
		}

		if (inspection_object.length>0) {
			var found_item = false
			for (item=0;item<inspection_object.length;item++) {
			  	if (inspection_object[item].id == req.body.id) {
			  		found_item=true
			  		var return_table = {}
			  		return_table.table = marginal_loss_factor_helpers.format_properties_as_table(inspection_object[item].description)
			  		return_table.map_output = inspection_object[item].map_output
			  		res.send(return_table)
			  	}
	  		}
	  		if (found_item == false) {
	  			res.send('<p>There was some error inspecting this item.</p>')
	  		}
		} else {
			res.send('<p>There was some error inspecting this item.</p>')
		}

	})

	// Reload Generators

	router.post('/marginal_loss_factor_generator_reload', function(req, res, next) {
		
		var temp_grid_map_ref_browser = []
		var mlf_year = 'mlf_' + (req.body.year - 2000)
		for (server_generator=0; server_generator<grid_map_ref_server.generator.length;server_generator++) {
			if (grid_map_ref_server.generator[server_generator][mlf_year] != null && grid_map_ref_server.generator[server_generator][mlf_year] != '') {
				var temp_mlf = grid_map_ref_server.generator[server_generator][mlf_year]
                var temp_color='grey'

                if (temp_mlf=='') {
                    temp_color='grey' //20% //50%
                } else if (temp_mlf < 0.875) {
                    temp_color='very_deep_red' //AA0000
                } else if (temp_mlf < 0.9) {
                    temp_color='deep_red' //FF2A2A
                } else if (temp_mlf< 0.925) {
                    temp_color='red' //FF8080
                } else if (temp_mlf < 0.95) {
                    temp_color='light_red' //FF5555 //FF2A2A
                } else if (temp_mlf < 0.975) {
                    temp_color='light_blue' //80B3FF
                } else if (temp_mlf < 1.0) {
                    temp_color='blue' //0066FF
                } else {
                    temp_color='dark_blue' //0044AA
                }

       	        temp_grid_map_ref_browser.push({
                    id: grid_map_ref_server.generator[server_generator].id,
                    position: grid_map_ref_server.generator[server_generator].position,
                    size: grid_map_ref_server.generator[server_generator].total_cap,
                    icon: temp_color + '_' + grid_map_ref_server.generator[server_generator].marker_type.toLowerCase() + '.png' 
                })
               
			}
		}

		res.send(temp_grid_map_ref_browser)

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
