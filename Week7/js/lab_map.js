// Global variables
let map;
let lat = 0;
let lon = 0;
let zl = 3;
let path = '';
// put this in your global variables
let geojsonPath = 'data/world.json';
let geojson_data;
let geojson_layer;

let brew = new classyBrew();

let legend = L.control({position: 'bottomright'});

let info_panel = L.control();

// initialize
$( document ).ready(function() {
    createMap(lat,lon,zl);
    // here you have to run all functions that you create later on 
    getGeoJSON();
});

// create the map
function createMap(lat,lon,zl){
	map = L.map('map').setView([lat,lon], zl);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
}

// GRAB & MAP GEOJSON DATA: function to get the geojson data (this is a jquery, similar to papaparse)
function getGeoJSON(){

	$.getJSON(geojsonPath,function(data){ // geojsonPath is the path to the geojson file
		console.log(data)

		// put the data in a global variable
		geojson_data = data;

		// call the map function
		mapGeoJSON('pop_est') // add the field to be used!!!!
	})
}

function mapGeoJSON(field){

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
		values.push(item.properties[field])
	})

	// set up the "brew" options
	brew.setSeries(values);
	brew.setNumClasses(9); // between 3 - 9 (or maybe depends on the variable)
	brew.setColorCode('RdYlGn'); // brew color options 
	brew.classify('jenks'); // brew classification method 

	// create the layer and add to map
	geojson_layer = L.geoJson(geojson_data, {
		style: getStyle, //call a function to style each feature
        onEachFeature: onEachFeature // add this arg to implement actions on each feature
	}).addTo(map);

	map.fitBounds(geojson_layer.getBounds())

    // create the legend
	createLegend();

    // create the infopanel
	createInfoPanel();
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



/* THE CODE BELOW: if we did not use classic brew, and if we wanted to hard code the colors

// function to map a geojson file
function mapGeoJSON(){

	// create the layer and add to map
	geojson_layer = L.geoJson(geojson_data, {
		style: getStyle // create and call a function to style each feature
	}).addTo(map);

	// fit to bounds
	map.fitBounds(geojson_layer.getBounds())
}

// style each feature
function getStyle(feature){
	return {
		stroke: true, // adds an outline
		color: 'white', // outline color
		weight: 1, // outline width
		fill: true,
		fillColor: getColor(feature.properties['pop_est']), // instead of a single color, make it based on the population value!
		fillOpacity: 0.8
	}
}

// return the color for each feature based on population count
//// note that this is 'hard coding' - inputting numbers instead of calculating it. it won't work anymore if the variables and range changes.
function getColor(d) {

	return d > 1000000000 ? '#800026' :
		   d > 500000000  ? '#BD0026' :
		   d > 200000000  ? '#E31A1C' :
		   d > 100000000  ? '#FC4E2A' :
		   d > 50000000   ? '#FD8D3C' :
		   d > 20000000   ? '#FEB24C' :
		   d > 10000000   ? '#FED976' :
					  '#FFEDA0';
}
*/

// LEGEND
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
					'<i style="background:' + brew.getColorInRange(from) + '"></i> ' +
					from.toFixed(2) + ' &ndash; ' + to.toFixed(2));
				}
			}
			
			div.innerHTML = labels.join('<br>');
			return div;
		};
		
		legend.addTo(map);
}

// onEachFeature ACTIONS: Functions that defines what will happen on user interactions with each feature
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

    info_panel.update(layer.feature.properties); // add info panel when a user hovers over a feature
}

// on mouse out, reset the style, otherwise, it will remain highlighted
function resetHighlight(e) {
	geojson_layer.resetStyle(e.target);
    info_panel.update(); // resets infopanel
}

// on mouse click on a feature, zoom in to it
function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

// INFO PANEL
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
			this._div.innerHTML = `<b>${properties.name}</b><br>${fieldtomap}: ${properties[fieldtomap]}`;
		}
		// if feature is not highlighted
		else
		{
			this._div.innerHTML = 'Hover over a country';
		}
	};

	info_panel.addTo(map);
}