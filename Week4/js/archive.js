// Global variables
let map;
let lat = 0;
let lon = 0;
let zl = 3;

// path to csv data
let path = "data/casenumbers_apr24.csv";

// global variables
let markers = L.featureGroup();

// initialize
$( document ).ready(function() {
    createMap(lat,lon,zl);
    readCSV(path);
});


// create the map
function createMap(lat,lon,zl){
    map = L.map('map').setView([lat,lon], zl);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

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

// mapCSV() function: that takes in the data from the csv file, creates a marker for each element, and maps it

// this is the original function with the non-circle marker, no hover event, no sidebar images, no panTo function 
/* function mapCSV(data){
    
    // loop through each entry
    data.data.forEach(function(item,index){
        // create marker
        let marker = L.marker([item.latitude,item.longitude])

        // add marker to featuregroup
        markers.addLayer(marker)
    })

    // add featuregroup to map
    markers.addTo(map)

    // fit markers to map
    map.fitBounds(markers.getBounds())
} */


function mapCSV(data){

	// circle options
	let circleOptions = {
		radius: 5,
		weight: 1,
		color: 'white',
		fillColor: 'dodgerblue',
		fillOpacity: 1
	}

	// loop through each entry
	data.data.forEach(function(item,index){
		// create a marker
		let marker = L.circleMarker([item.lat,item.lng],circleOptions)
		.on('mouseover',function(){
			this.bindPopup(`${item.city_state}<br>${item.count_crimes}`).openPopup() //<img src="${item.thumbnail_url}">
		})

		// add marker to featuregroup
		markers.addLayer(marker)

		// add entry to sidebar
		// $('.sidebar').append(`<img src="${item.thumbnail_url}" onmouseover="panToImage(${index})">`)
	})

	// add featuregroup to map
	markers.addTo(map)

	// fit map to markers
	map.fitBounds(markers.getBounds())
}

function panToImage(index){
	map.setZoom(17);
	map.panTo(markers.getLayers()[index]._latlng);
}
