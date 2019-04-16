// Handle Inspections

function inspect(inspection_type, object_id) {
	$.ajax({
            method: "POST",
            url: "/marginal_loss_factor_inspection",
            data: {
            	type: inspection_type, 
            	id: object_id
            }
        })
    .done(function(return_html) {
		$('#inspection_output').html(return_html.table)
        $('#inspection_map_output').html(return_html.map_output)
	})
}

function reload_generators(year, map, callback) {
    $.ajax({
        method: "POST",
        url: "/marginal_loss_factor_generator_reload",
        data: {
            year: year
        }
    })
    .done(function(generator_array) {
        for (marker = 0; marker < generator_markers.length; marker++) {
          generator_markers[marker].setMap(null);
        }
        generator_markers = []

        var zoom = map.getZoom()
        var relative_pixel_size = 8

        if (zoom<5) {
            relative_pixel_size=1
        } else {
            if (zoom>10) {
                relative_pixel_size = 64
            } else {
                var interum_sizes = [8,16,32,32, 32, 64]
                relative_pixel_size = interum_sizes[zoom-5]
            }
        }

        for (generator=0;generator<generator_array.length;generator++) {

            var generation_marker = new google.maps.MarkerImage(
                '/images/map_icons/' + generator_array[generator].icon,
                new google.maps.Size(relative_pixel_size,relative_pixel_size), //size
                null, //origin
                null, //anchor
                new google.maps.Size(relative_pixel_size,relative_pixel_size) //scale
            );

            generator_array[generator].icon = generation_marker

            var generator_marker = new google.maps.Marker(generator_array[generator])

            generator_marker.addListener('click', function() { 
                inspect('g', this.id)
            })

            generator_marker.setMap(map)

            generator_markers.push(generator_marker)

        }
        callback()
    })
}