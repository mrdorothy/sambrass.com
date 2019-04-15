module.exports = {

	format_properties_as_table: function(properties_object) {
		var table_string = '<table>'
		for (properties in properties_object) {
			if (properties_object[properties]!= null && properties_object[properties]!= '') {
				table_string += `
					<tr>
						<th> 
							${properties.replace('_',' ')}
						</th>
						<td>
							${properties_object[properties]}
						</td>
					</tr>`
			}
		}
		return table_string + '</table>'
	}

}