// handle inspections

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
		$('#inspection_output').html(return_html)
	})
}