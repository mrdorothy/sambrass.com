var log = require('../helpers/log.js');
var fs = require('fs');
var async = require('async');
var csv = require('csvtojson')

module.exports = function(callback) {

        var grid_map_ref_browser = {
            transmission: [], // id, path, strokeColor, strokeWeight, strokeOpacity
            elec_station: [], // id, location, name
            generator: [] // id, location, size, name, start year, end year, color {}
        }
        var grid_map_ref_server = {
            transmission: [], // id, properties
            elec_station: [], // id, properties
            generator: [] // id, properties, mlf values
        }

        // Transmission Data

        var transmission_data = require('../data/raw/transmission.json')

        var colour_scheme = {
            11: { colour: '#ff4d6d', width: 1.2 },
            22: { colour: '#ff4d6d', width: 1.2 },
            33: { colour: '#ff4d6d', width: 1.2 },
            44: { colour: '#ff4d6d', width: 1.2 },
            66: { colour: '#ff4d6d', width: 1.2 },
            88: { colour: '#ff4d6d', width: 1.2 },
            110: { colour: '#ff1a44', width: 1.2 },
            132: { colour: '#ff1a44', width: 1.2 },
            220: { colour: '#cc0025', width: 1.3 },
            275: { colour: '#cc0025', width: 1.3 },
            330: { colour: '#800017', width: 1.4 },
            400: { colour: '#330009', width: 1.4 },
            500: { colour: '#330009', width: 1.5 }
        }

        var transmission_x_scale = transmission_data.transform.scale[0]
        var transmission_y_scale = transmission_data.transform.scale[1]
        var transmission_x_translate = transmission_data.transform.translate[0]
        var transmission_y_translate = transmission_data.transform.translate[1]

        for (line = 0; line < transmission_data.objects.collection.geometries.length; line++) {

            if (transmission_data.objects.collection.geometries[line].arcs) {

                for (arc = 0; arc < transmission_data.objects.collection.geometries[line].arcs.length; arc++) {

                    if (transmission_data.arcs[transmission_data.objects.collection.geometries[line].arcs[arc]]) {

                        var temp_path = []
                        var temp_arc = transmission_data.arcs[transmission_data.objects.collection.geometries[line].arcs[arc]]
                        var init_x = temp_arc[0][0]
                        var init_y = temp_arc[0][1]

                        temp_path.push({
                            lat: init_y * transmission_y_scale + transmission_y_translate,
                            lng: init_x * transmission_x_scale + transmission_x_translate
                        })

                        var temp_x = init_x
                        var temp_y = init_y

                        for (point = 1; point < temp_arc.length; point++) {

                            temp_x = temp_x + temp_arc[point][0]
                            temp_y = temp_y + temp_arc[point][1]

                            temp_path.push({
                                lat: temp_y * transmission_y_scale + transmission_y_translate,
                                lng: temp_x * transmission_x_scale + transmission_x_translate
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

        for (line=0; line<grid_map_ref_server.transmission.length;line++) {
            grid_map_ref_server.transmission[line].description={
                Name:grid_map_ref_server.transmission[line].properties.NAME,
                Type: 'Transmission Line',
                State:grid_map_ref_server.transmission[line].properties.STATE,
                Capacity:`${grid_map_ref_server.transmission[line].properties.CAPACITY_kV} kV`,
                Type: grid_map_ref_server.transmission[line].properties.CONSTRUCTIONTYPE,
                Status: grid_map_ref_server.transmission[line].properties.STATUS
            }
            grid_map_ref_server.transmission[line].map_output = `${grid_map_ref_server.transmission[line].properties.NAME} ${grid_map_ref_server.transmission[line].properties.CAPACITY_kV} kV Line`
        }

        // Elec Station Data

        var elec_station_data = require('../data/raw/elec_stations.json')

        var elec_station_x_scale = elec_station_data.transform.scale[0]
        var elec_station_y_scale = elec_station_data.transform.scale[1]
        var elec_station_x_translate = elec_station_data.transform.translate[0]
        var elec_station_y_translate = elec_station_data.transform.translate[1]

        var elec_id = 0

        for (elec_station = 0; elec_station < elec_station_data.objects.collection.geometries.length; elec_station++) {

            var temp_position = {
                lat: elec_station_data.objects.collection.geometries[elec_station].coordinates[1] * elec_station_y_scale + elec_station_y_translate,
                lng: elec_station_data.objects.collection.geometries[elec_station].coordinates[0] * elec_station_x_scale + elec_station_x_translate
            }

            grid_map_ref_browser.elec_station.push({
                id: elec_id,
                name: elec_station_data.objects.collection.geometries[elec_station].properties.ASSET_NAME,
                position: temp_position
            })

            grid_map_ref_server.elec_station.push({
                id: elec_id,
                properties: elec_station_data.objects.collection.geometries[elec_station].properties
            })

            elec_id += 1

        }

        for (station=0; station<grid_map_ref_server.elec_station.length;station++) {
            grid_map_ref_server.elec_station[station].description={
                Name:grid_map_ref_server.elec_station[station].properties.ASSET_NAME,
                Type: 'Substation',
                State:grid_map_ref_server.elec_station[station].properties.REGION
            }
            grid_map_ref_server.elec_station[station].map_output = `${grid_map_ref_server.elec_station[station].properties.ASSET_NAME} Substation`
        }

        // Generators Data

        

        csv().fromFile('./data/raw/generators.csv')
            .then((temp_generator_json)=>{
                var generator_json = []

                for (generator=0;generator<temp_generator_json.length;generator++) {
                    var already_included = false
                    for (generator_1=0;generator_1<generator_json.length;generator_1++) {
                        if (temp_generator_json[generator].station == generator_json[generator_1].station) {
                            already_included = true
                            generator_json[generator_1].duid.push(temp_generator_json[generator].duid)
                            generator_json[generator_1].connection_id.push(temp_generator_json[generator].connection_id)
                            generator_json[generator_1].connection_voltage.push(parseFloat(temp_generator_json[generator].connection_voltage))
                            generator_json[generator_1].reg_cap.push(parseFloat(temp_generator_json[generator].reg_cap))
                            generator_json[generator_1].max_cap.push(parseFloat(temp_generator_json[generator].max_cap))
                        }
                    }
                    if (!already_included) {
                        generator_json.push(temp_generator_json[generator])
                        generator_json[generator_1].duid=[temp_generator_json[generator].duid]
                        generator_json[generator_1].connection_id=[temp_generator_json[generator].connection_id]
                        generator_json[generator_1].connection_voltage=[parseFloat(temp_generator_json[generator].connection_voltage)]
                        generator_json[generator_1].reg_cap=[parseFloat(temp_generator_json[generator].reg_cap)]
                        generator_json[generator_1].max_cap=[parseFloat(temp_generator_json[generator].max_cap)]
                    }
                }

                for (generator=0;generator<generator_json.length;generator++) {

                    generator_json[generator].position = JSON.parse(generator_json[generator].position)
                    var total_cap = 0
                    for (duid=0;duid<generator_json[generator].reg_cap.length;duid++) {
                        total_cap += generator_json[generator].reg_cap[duid]
                    }
                    generator_json[generator].total_cap = total_cap
                    generator_json[generator].id = generator_json[generator].station
                    for(property in generator_json[generator]) {
                        if (property.substring(0,3)=='mlf') {
                            generator_json[generator][property]=parseFloat(generator_json[generator][property])
                        }
                    }

                }

                for (generator=0;generator<generator_json.length;generator++) {

                    grid_map_ref_server.generator.push(generator_json[generator])
                    if (generator_json[generator].mlf_20) {
                        var temp_color='grey'

                        if (generator_json[generator].mlf_20=='') {
                            temp_color='grey' //20% //50%
                        } else if (generator_json[generator].mlf_20 < 0.875) {
                            temp_color='very_deep_red' //AA0000
                        } else if (generator_json[generator].mlf_20 < 0.9) {
                            temp_color='deep_red' //FF2A2A
                        } else if (generator_json[generator].mlf_20 < 0.925) {
                            temp_color='red' //FF8080
                        } else if (generator_json[generator].mlf_20 < 0.95) {
                            temp_color='light_red' //FF5555 //FF2A2A
                        } else if (generator_json[generator].mlf_20 < 0.975) {
                            temp_color='light_blue' //80B3FF
                        } else if (generator_json[generator].mlf_20 < 1.0) {
                            temp_color='blue' //0066FF
                        } else {
                            temp_color='dark_blue' //0044AA
                        }

                        grid_map_ref_browser.generator.push({
                            id: generator_json[generator].id,
                            position: generator_json[generator].position,
                            size: generator_json[generator].total_cap,
                            icon: temp_color + '_' + generator_json[generator].marker_type.toLowerCase() + '.png' 
                        })
                    }
                }

                for (generator=0; generator<grid_map_ref_server.generator.length;generator++) {
                    
                    var connection_string = ''
                    var connection_voltage_string = ''
                    for (duid=0; duid<grid_map_ref_server.generator[generator].duid.length;duid++) {
                        connection_string+=grid_map_ref_server.generator[generator].connection_id[duid] + ', '
                        connection_voltage_string+=grid_map_ref_server.generator[generator].connection_voltage[duid] + ' kV, '
                    }
                    connection_string=connection_string.substring(0,connection_string.length-2)
                    connection_voltage_string=connection_voltage_string.substring(0,connection_voltage_string.length-2)

                    grid_map_ref_server.generator[generator].description={
                        Name: grid_map_ref_server.generator[generator].name,
                        Type: 'Power Station',
                        State: grid_map_ref_server.generator[generator].region,
                        Fuel_Source: grid_map_ref_server.generator[generator].fuel_source_secondary,
                        Capacity: `${grid_map_ref_server.generator[generator].total_cap} MW`,
                        Connection: connection_string,
                        Connection_Voltage: connection_voltage_string,
                        MLF: `
                            <table>
                                <tr><th>Year</th><th>MLF</th></tr>
                                <tr><td>FY13</td><td>${grid_map_ref_server.generator[generator].mlf_13 || ''}</td></tr>
                                <tr><td>FY14</td><td>${grid_map_ref_server.generator[generator].mlf_14 || ''}</td></tr>
                                <tr><td>FY15</td><td>${grid_map_ref_server.generator[generator].mlf_15 || ''}</td></tr>
                                <tr><td>FY16</td><td>${grid_map_ref_server.generator[generator].mlf_16 || ''}</td></tr>
                                <tr><td>FY17</td><td>${grid_map_ref_server.generator[generator].mlf_17 || ''}</td></tr>
                                <tr><td>FY18</td><td>${grid_map_ref_server.generator[generator].mlf_18 || ''}</td></tr>
                                <tr><td>FY19</td><td>${grid_map_ref_server.generator[generator].mlf_19 || ''}</td></tr>
                                <tr><td>FY20</td><td>${grid_map_ref_server.generator[generator].mlf_20 || ''}</td></tr>
                            </table>`
                    }
                    grid_map_ref_server.generator[generator].map_output = `${grid_map_ref_server.generator[generator].name} (${grid_map_ref_server.generator[generator].total_cap} MW)`
                }    

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

            })
                

        // Write to file

       
}