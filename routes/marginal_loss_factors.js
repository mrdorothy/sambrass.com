var log = require('../helpers/log.js');

module.exports = function() {
	var transmission = require('../data/grid.json')
	
	var x_scale = transmission.transform.scale[0]
	var y_scale = transmission.transform.scale[1]
	var x_translate = transmission.transform.translate[0]
	var y_translate = transmission.transform.translate[1]

	var grid_overlay = []

	for (line=0;line<transmission.objects.collection.geometries.length;line++) {
		if (!transmission.objects.collection.geometries[line].arcs) {
			
			log(transmission.objects.collection.geometries[line].properties.NAME + ' has no arcs...')
		
		} else {

			for(arc=0;arc<transmission.objects.collection.geometries[line].arcs.length;arc++) {
				
				if (!transmission.arcs[transmission.objects.collection.geometries[line].arcs[arc]]) {
					
					log(transmission.objects.collection.geometries[line].properties.NAME + ' has a negative arc ref ' + transmission.objects.collection.geometries[line].arcs[arc])
				
				} else {

					var temp_path =[]
					var temp_arc = transmission.arcs[transmission.objects.collection.geometries[line].arcs[arc]]
					var init_x = temp_arc[0][0]
					var init_y = temp_arc[0][1]
					temp_path.push({
						lat: init_y * y_scale + y_translate,
						lng: init_x * x_scale + x_translate
					})

					var temp_x = init_x
					var temp_y = init_y

					for(point=1;point<temp_arc.length;point++) {

						temp_x = temp_x + temp_arc[point][0]
						temp_y = temp_y + temp_arc[point][1]


						temp_path.push({
							lat: temp_y * y_scale + y_translate,
							lng: temp_x * x_scale + x_translate
						})
					}

					grid_overlay.push({
						path: temp_path,
						strokeColor: transmission.objects.collection.geometries[line].properties.stroke,
	    				strokeOpacity: transmission.objects.collection.geometries[line].properties['stroke-opacity'],
	    				strokeWeight: transmission.objects.collection.geometries[line].properties['stroke-width']
					})
				}
			}
		}
	}

	return grid_overlay

}



