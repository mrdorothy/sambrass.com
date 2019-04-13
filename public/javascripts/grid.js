$.ajax({
        method: "POST",
        url: "/get_grid_data",
    })
    .done(function(return_data) {
        console.log(return_data)
        labels = []
        values = []
        return_data.forEach(function(time_stamp) {
            labels.push(moment(time_stamp.timestamp).format('D MMM YYYY h:mma'))
            //labels.push(time_stamp.timestamp)
            values.push(parseFloat(time_stamp.output))
        });
        //console.log(return_data)
        $('#grid_chart').html('<canvas id="grid_chart_canvas" width="20px" height="300px"></canvas>')

        var ctx = document.getElementById("grid_chart_canvas");
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: 'rgba(179, 255, 224,0.5)',
                    borderColor: 'rgb(0, 204, 122)',
                    pointRadius: 2,
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: false
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        ticks: {
                            minRotation: 90,
                            autoSkip: true,
                            maxTicksLimit: 24
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            callback: function(value, index, values) {
                                return Math.round(value/1000) + ",000 MW";
                            },
                            beginAtZero: true
                        }
                    }]
                }
            }
        });


        /*var ctx = $('#grid_chart_canvas');
        var myLineChart = new Chart(ctx, {
		    type: 'line',
		    data:[1,5,4,12]
		    /*data: values,
		    options: {
		        scales: {
		            xAxes: [{
		                type: 'time'
		            }],
		            yAxes: [{
	                    display: true,
	                    ticks: {
	                        beginAtZero: true,
	                        steps: 8,
	                        stepValue: 5000,
	                        max: 40000
	                    }
                    }]
		        }
		    }
		});*/

    });