// Global variables
let map;
let lat = 39;
let lon = -98;
let zl = 4;

let geojsonPath = 'data/merged.geojson';
let geojson_data;
let geojson_layer;

let brew = new classyBrew();
let legend = L.control({position: 'bottomright'});
let info_panel = L.control();

let fieldtomap = 'Median Household Income (In 2019 Inflation Adjusted Dollars)';

// initialize
$( document ).ready(function() {
	createMap(lat,lon,zl);
	getGeoJSON();
});

// create the map
function createMap(lat,lon,zl){
	map = L.map('map').setView([lat,lon], zl);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
}

// function to get the geojson data
function getGeoJSON(){

	$.getJSON(geojsonPath,function(data){
		console.log(data)

		// put the data in a global variable
		geojson_data = data;

		// call the map function
		mapGeoJSON(fieldtomap,5,'YlOrRd','quantiles');
	})
}

function mapGeoJSON(field,num_classes,color,scheme){

	// clear layers in case it has been mapped already
	if (geojson_layer){
		geojson_layer.clearLayers()
	}
	
	// globalize the field to map
	fieldtomap = field;

	// create an empty array
	let values = [];

	// based on the provided field, enter each value into the array
	geojson_data.features.forEach(function(item,index){
		if((item.properties[field] != undefined ) ){
			values.push(item.properties[field])
		}
	})

	// set up the "brew" options
	brew.setSeries(values);
	brew.setNumClasses(num_classes);
	brew.setColorCode(color);
	brew.classify(scheme);

	// create the layer and add to map
	geojson_layer = L.geoJson(geojson_data, {
		style: getStyle, //call a function to style each feature
		onEachFeature: onEachFeature // actions on each feature
	}).addTo(map);

	// turning off fit bounds so that we stay in mainland USA
	// map.fitBounds(geojson_layer.getBounds())

	// create the legend
	createLegend();

	// create the infopanel
	createInfoPanel();

    // create the table
	createTable();
}

function getStyle(feature){
	return {
		stroke: true,
		color: 'white',
		weight: 1,
		fill: true,
		fillColor: brew.getColorInRange(feature.properties[fieldtomap]),
		fillOpacity: 0.8
	}
}

function createLegend(){
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
		breaks = brew.getBreaks(),
		labels = [],
		from, to;
		
		for (var i = 0; i < breaks.length; i++) {
			from = breaks[i];
			to = breaks[i + 1];
			if(to) {
				labels.push(
					'<i style="background:' + brew.getColorInRange(to) + '"></i> ' +
					from.toFixed(0) + ' &ndash; ' + to.toFixed(0));
				}
			}
			
			div.innerHTML = labels.join('<br>');
			return div;
		};
		
		legend.addTo(map);
}

function createInfoPanel(){

	info_panel.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info_panel.update = function (properties) {
		// if feature is highlighted
		if(properties){
			this._div.innerHTML = `<b>${properties['Qualifying Name']}</b><br>${fieldtomap}: ${properties[fieldtomap]}`;
		}
		// if feature is not highlighted
		else
		{
			this._div.innerHTML = 'Hover over a country';
		}
	};

	info_panel.addTo(map);
}

// Function that defines what will happen on user interactions with each feature
function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}

// on mouse over, highlight the feature
function highlightFeature(e) {
	var layer = e.target;

	// style to use on mouse over
	layer.setStyle({
		weight: 2,
		color: '#666',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

	info_panel.update(layer.feature.properties);

    createDashboard(layer.feature.properties)
}

// on mouse out, reset the style, otherwise, it will remain highlighted
function resetHighlight(e) {
	geojson_layer.resetStyle(e.target);
	info_panel.update() // resets infopanel
}

// on mouse click on a feature, zoom in to it
function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

// createDashboard function
function createDashboard(properties){

	// clear dashboard
	$('.dashboard').empty();

	console.log(properties)

	// chart title: can put variable name !!!
	let title = properties['Qualifying Name']; // city name variable in dataset

	// data values: insert values OR variable names here !!!
	// let data = [27,17,17,20]; 
    let data = [properties['% Households: Less than $25,000'], properties['% Households: $25,000 to $49,999'], properties['% Households: $50,000 to $74,999'], properties['% Households: $75,000 to $99,999'], properties['% Households: $100,000 or More']]
    // note: % is part of the column name, not that you need it specially


	// data fields: labels for the pie chart !!!
	let fields = ['Less than $25K','$25K to $50K','$50K to $75K','$75K to $100K', 'More than $100K'];

	// set chart options
	let options = {
		chart: {
			type: 'bar',
			height: 300,
			animations: {
				enabled: false,
			}
		},
		title: {
			text: title,
		},
		plotOptions: {
			bar: {
				horizontal: true
			}
		},
		series: [
			{
				data: data
			}
		],
		xaxis: {
			categories: fields
		}

    
    /* for a pie chart:
    let options = {
	    chart: {
		    type: 'pie',
		    height: 400,
		    width: 400,			
		    animations: {
			    enabled: false,
		    }
	    },
	    title: {
		    text: title,
	    },
	    series: data,
	    labels: fields,
	    legend: {
	    position: 'right',
		    offsetY: 0,
		    height: 230,
	    }
    */
   
	}
	
	// create the chart
	let chart = new ApexCharts(document.querySelector('.dashboard'), options)
	chart.render()
}

// createTable function 
function createTable(){
	// empty array for our data
	let datafortable = [];

	// loop through the data and add the properties object to the array
	geojson_data.features.forEach(function(item){
		datafortable.push(item.properties)
	})
	console.log(datafortable)
}

// clickable row function
function zoomTo(geoid){

	let zoom2poly = geojson_layer.getLayers().filter(item => item.feature.properties.GEO_ID === geoid)

	map.fitBounds(zoom2poly[0].getBounds())

}