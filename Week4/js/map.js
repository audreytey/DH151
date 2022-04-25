// Global variables
let map;
let lat = 0;
let lon = 0;
let zl = 1;

// path to csv data
let path = "data/casenumbers_apr24.csv";

let markers = L.featureGroup();


// initialize
$( document ).ready(function() {
    createMap(lat,lon,zl);
    readCSV(path);
});

// create the map
function createMap(lat,lon,zl){
	map = L.map('map').setView([lat,lon], zl);

	L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
	}).addTo(map); // CartoDB.Voyager base map layer
}

function flyToIndex(lat, lon){
	map.flyTo([lat,lon],12)
};

// function to read csv data
function readCSV(path){
	Papa.parse(path, {
		header: true,
		download: true,
		complete: function(data) {
			console.log(data);
			
			// map the data
			mapCSV(data);

		}
	});
}

function mapCSV(data){
	
	// circle options
	let circleOptions = {
		radius: 3,
		weight: 1,
		color: 'white',
		fillColor: 'red',
		fillOpacity: 1
	}

	// loop through each entry
	data.data.forEach(function(item,index){
		if(typeof item.lat !== 'undefined' && typeof item.lng !== 'undefined'){
        
        // create marker
		let marker = L.circleMarker([item.lat,item.lng],circleOptions)
		.on('mouseover', function(){
			this.bindPopup(`${item.city_state}<br>Number of hate crimes: ${item.count_crimes}`).openPopup()
		})

		// add marker to featuregroup		
		markers.addLayer(marker)
        }
	})

	// add featuregroup to map
	markers.addTo(map)

	// fit markers to map
	map.fitBounds(markers.getBounds())
}
