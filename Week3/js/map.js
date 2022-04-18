// map settings
let map = L.map('map').setView([2.5, 115.6628], 4.25);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// locations
let data = [
    {
        'id': 0,
        'title':'Indonesia',
        'description':'Indonesia is the largest country in ASEAN, with a population of 270 million, it is the world\'s fourth-most populous country. It is also currently the G20 leader.',
        'lat': -6.12,
        'lon': 106.4
    },
    {
        'id': 1,
        'title':'Philippines',
        'description':'Philippines is an archipelagic country (island country) with diverse ethnicities and cultures throughout its islands.',
        'lat': 14.38,
        'lon': 121.02
    },
    {
        'id': 2,
        'title':'Thailand',
        'description':'Thailand, also known as Siam or the Kingdom of Thailand, is a constitutional monarchy with the King serves as the head of state and is highly respected by the people, although his powers are limited by the constitution and he is primarily a symbolic figurehead. From 2014 to 2019, Thailand was formally under military rule, until the military introduced a new constitution and held elections which established the framework of a parliamentary constitutional monarchy.',
        'lat': 15.8700,
        'lon': 100.9925
    },
    {
        'id': 3,
        'title':'Singapore',
        'description':'Singapore is an island city-state with the third greatest population density in the world. After early years of turbulence and despite lacking natural resources and a hinterland, the nation rapidly developed to become one of the Four Asian Tigers based on external trade. Today, it is a major financial and shipping hub and has consistently ranked highly in key social indicators such as education, healthcare and quality of life.',
        'lat': 1.3521,
        'lon': 103.8198
    },
    {
        'id': 4,
        'title':'Vietnam',
        'description':'Vietnam, officially the Socialist Republic of Vietnam, was reunified as a unitary socialist state under the Communist Party of Vietnam in 1976 following the end of the Vietnam War. In 1986, the Communist Party initiated economic and political reforms, transforming the country to a market-oriented economy.',
        'lat': 14.0583,
        'lon': 108.2772
    },
    {
        'id': 5,
        'title':'Malaysia',
        'description':'Malaysia consists of thirteen states and three federal territories. Kuala Lumpur is the national capital of Malaysia, Putrajaya is the administrative capital, and Labuan is an offshore international financial centre.',
        'lat': 3.1390,
        'lon': 101.6869
    },
    {
        'id': 6,
        'title':'Brunei',
        'description':'Brunei is located on the north coast of the island of Borneo. Crude oil and natural gas production account for about 90% of its GDP.',
        'lat': 4.5353,
        'lon': 114.7277
    },
    {
        'id': 7,
        'title':'Cambodia',
        'description':'Cambodia borders Thailand, Laos, and Vietnam. Buddhism is enshrined in the constitution as the official state religion, and is practised by more than 97% of the population.',
        'lat': 12.5657,
        'lon': 104.9910
    },
    {
        'id': 8,
        'title':'Laos',
        'description':'Laos is the only landlocked country in Southeast Asia and has a one-party socialist government.',
        'lat': 19.8563,
        'lon': 102.4955
    },
    {
        'id': 9,
        'title':'Myanmar',
        'description':'Myanmar is the largest country in mainland Southeast Asia, and has a population of about 54 million. In February 2021, the military junta launched a coup d\'état and overthrew the democratically-elected ruling party after they won by a landslide. Since then, the military has utilized violence to put down opposition activists and civilians, leading to a severe humanitarian crisis in Myanmar today.',
        'lat': 21.9162,
        'lon': 95.9560
    },
]


// before looping the data, create an empty FeatureGroup
let myMarkers = L.featureGroup();

// loop through data
data.forEach(function(item){
	// create marker
	let marker = L.marker([item.lat,item.lon], 
        // map marker icons
        {icon: new L.Icon({
            iconUrl: `./countryflags/${item.title}.png`,
            iconSize: [50, 30],
            iconAnchor: [10, 0],
        })})
    .bindPopup('<b>'+item.title+'</b>' + '<br>' + item.description)

	// add marker to featuregroup
	myMarkers.addLayer(marker)

	// add data to sidebar with onclick event
	$('.sidebar').append(`<div class="sidebar-item" onclick="flyToIndex(${item.id})">
    <img class="sidebar-item" src="./countryflags/${item.title}.png" width="55px">
    </div>`)
})

// after loop, add the FeatureGroup to map
myMarkers.addTo(map)

// define layers
let layers = {
	"My Markers": myMarkers
}

// add layer control box
L.control.layers(null,layers).addTo(map)

// make the map zoom to the extent of markers
map.fitBounds(myMarkers.getBounds());


/* OLD STUFF BELOW, REPLACED BY FEATUREGROUP: 
// loop through data
data.forEach(function(item, index){
    let marker = L.marker([item.lat,item.lon]).addTo(map)
        .bindPopup(item.title)

    // add data to sidebar (THIS WAS THE JQUERY CODE ADDED FROM LAB)
	// alert: $('.sidebar').append(`<div class="sidebar-item" onclick="alert('you clicked ${item.title}!')">${item.title}</div>`)
    $('.sidebar').append(`<div class="sidebar-item" onclick="flyToIndex(${index})">${item.title}</div>`)

}); */

// function to fly to a location by a given id number
function flyToIndex(index){
	map.flyTo([data[index].lat,data[index].lon],12)

    // open the popup
	myMarkers.getLayers()[index].openPopup()
}




