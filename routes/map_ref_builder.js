var log = require('../helpers/log.js');
var fs = require('fs');
var async = require('async');

module.exports = function(callback) {

        var grid_map_ref_browser = {
            transmission: [], // id, path, strokeColor, strokeWeight, strokeOpacity
            elec_station: [], // id, location, name
            plant: [] // id, location, size, name, start year, end year, color {}
        }
        var grid_map_ref_server = {
            transmission: [], // id, properties
            elec_station: [], // id, properties
            plant: [] // id, properties, mlf values
        }

        // Transmission Data

        var transmission_data = require('../data/raw/transmission.json')

        var colour_scheme = {
            11: { colour: '#ffc3ce', width: 0.8 },
            22: { colour: '#ffc3ce', width: 0.8 },
            33: { colour: '#ffc3ce', width: 0.8 },
            44: { colour: '#ffc3ce', width: 1 },
            66: { colour: '#ffc3ce', width: 1 },
            88: { colour: '#ffc3ce', width: 1 },
            110: { colour: '#ff1a44', width: 1.2 },
            132: { colour: '#ff1a44', width: 1.2 },
            220: { colour: '#cc0025', width: 1.3 },
            275: { colour: '#cc0025', width: 1.3 },
            330: { colour: '#800017', width: 1.4 },
            400: { colour: '#330009', width: 1.4 },
            500: { colour: '#330009', width: 1.5 }
        }

        var x_scale = transmission_data.transform.scale[0]
        var y_scale = transmission_data.transform.scale[1]
        var x_translate = transmission_data.transform.translate[0]
        var y_translate = transmission_data.transform.translate[1]

        for (line = 0; line < transmission_data.objects.collection.geometries.length; line++) {

            if (transmission_data.objects.collection.geometries[line].arcs) {

                for (arc = 0; arc < transmission_data.objects.collection.geometries[line].arcs.length; arc++) {

                    if (transmission_data.arcs[transmission_data.objects.collection.geometries[line].arcs[arc]]) {

                        var temp_path = []
                        var temp_arc = transmission_data.arcs[transmission_data.objects.collection.geometries[line].arcs[arc]]
                        var init_x = temp_arc[0][0]
                        var init_y = temp_arc[0][1]

                        temp_path.push({
                            lat: init_y * y_scale + y_translate,
                            lng: init_x * x_scale + x_translate
                        })

                        var temp_x = init_x
                        var temp_y = init_y

                        for (point = 1; point < temp_arc.length; point++) {

                            temp_x = temp_x + temp_arc[point][0]
                            temp_y = temp_y + temp_arc[point][1]

                            temp_path.push({
                                lat: temp_y * y_scale + y_translate,
                                lng: temp_x * x_scale + x_translate
                            })
                        }

                        grid_map_ref_browser.transmission.push({
                            id: transmission_data.objects.collection.geometries[line].properties.OBJECTID,
                            path: temp_path,
                            strokeColor: colour_scheme[transmission_data.objects.collection.geometries[line].properties.CAPACITY_kV].colour,
                            strokeWeight: colour_scheme[transmission_data.objects.collection.geometries[line].properties.CAPACITY_kV].width,
                            strokeOpacity: 0.8
                        })

                        grid_map_ref_server.transmission.push({
                            id: transmission_data.objects.collection.geometries[line].properties.OBJECTID,
                            properties: transmission_data.objects.collection.geometries[line].properties
                        })
                    }
                }
            }
        }

        // Write to file

        var grid_map_ref_browser_json = JSON.stringify(grid_map_ref_browser);
        var grid_map_ref_server_json = JSON.stringify(grid_map_ref_server);

        async.parallel({
            browser_write: function(async_callback) {
                fs.writeFile('./data/grid_map_ref_browser.json', grid_map_ref_browser_json, 'utf8', function(err) {
                    async_callback(null)
                })
            },
            server_write: function(async_callback) {
                fs.writeFile('./data/grid_map_ref_server.json', grid_map_ref_server_json, 'utf8', function(err) {
                    async_callback(null)
                })
            }
        }, function() {
            grid_map_ref_server = require('../data/grid_map_ref_server.json')
            grid_map_ref_browser = require('../data/grid_map_ref_browser.json')
            callback(grid_map_ref_server, grid_map_ref_browser)
        })
}