//	Displays a map 
//	Uses the Leaflet package with geojson inputs obtained through ajax calls to node.js via express
//
//	Creates map area
var map = L.map('map', {
	center: [52.3584,-1.4649],
	maxZoom: 15,
	zoom: 12
});

// prepare all other layers, adding basemap  tiles to start with /
var tile = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    subdomains: ['a','b','c'],
	opacity: 0.75
}).addTo( map );

//	Adds a second, topographic, basemap
var topography = '/topography.jpg', 
	imageBounds = [[52.281405911,-1.576311548],[52.435227039,-1.354224667]];
var topotile = L.imageOverlay(topography, imageBounds).addTo(map);
topotile.setOpacity(0.8);

//	Adds links and attributions 
var osmattrib = L.control.attribution({options: {
		position: 'bottomright'
	},prefix: '&copy;<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
var sodhslink = L.control.attribution({options: {
		position: 'bottomright'
	},prefix: '<a href="http://www.stretton-on-dunsmore-history.org.uk" target="SODHS">Stretton History Society</a>'}).addTo(map);
var nlslink = L.control.attribution({options: {
		position: 'bottomright'
	},prefix: '<a href="https://maps.nls.uk/geo/explore/#zoom=14&lat=52.34374&lon=-1.44998&layers=168&b=1" target="NLS">National Library of Scotland</a>'}).addTo(map);
var dunsmorelink = L.control.attribution({options: {
		position: 'bottomright'
	},prefix: '<a href="https://www.exploredunsmore.org/" target="Dunsmore">Dunsmore Living Landscape</a>'}).addTo(map);

//	Adds a vector layer showing the project study areas
// 	A pdf on each area can be opened in a new browser window from the tooltip
var areas	= new L.geoJson.ajax('/woodland/area', {
	style(feature) {
		return { color: 'red', fill: false };
	},
	onEachFeature: function(feature, layer) {
		layer.on({click: zoomToArea}),
		layer.bindTooltip('<a href="https://polar-tor-01758.herokuapp.com/pdfs/Area' + feature.properties.Area + '.pdf" target="Area">Area ' + feature.properties.Area +'</a>', 
		{permanent: true, direction: 'center', opacity: 0.8, interactive: true});
	}
}).addTo(map);
function zoomToArea(e) {
	map.fitBounds(e.target.getBounds());
}

//	Adds a vector layer showing the project woods
var Woods = new L.geoJson.ajax('/woodland/woods', {
	style: function(feature) {
        switch (feature.properties.Present) {
            case 'yes': return {color: "green"};
            case 'no':  return {color: "brown"};
			case 'pt':   return {color: "blue"};}
		fillOpacity: 0.8
    },
	onEachFeature: function(feature, layer) {
		layer.on({mouseover: highlightPoly, mouseout: resetPoly, click: zoomToPoly }),
		layer.bindPopup('<b>Name: </b> '	+ feature.properties.name + '<br>' +
						'<b>Old Name: </b> ' 			+ feature.properties.OldName + '<br>' + 
						'<b>Description: </b> ' 		+ feature.properties.OldDesc + '<br>' +
						'<b>Source: </b> '				+ feature.properties.OldSource + '<br>' +
						'<b>Area: </b> '					+ feature.properties.Area + '<br>' +
						'<b>Present: </b> '				+ feature.properties.Present + '<br>' +
						'<b>OS 1888: </b> '				+ feature.properties.OS1888 + '<br>'
						, {maxWidth : 400});
	}
}).addTo(map);

// create mouse functions and style for woods and parklands
function highlightPoly(e) {
	var layer = e.target;
	layer.setStyle({weight: 5, color: '#666', dashArray: '', fillOpacity: 0.7});
	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge ) {
		layer.bringToFront();}}	
function resetPoly(e) {
	Woods.resetStyle();}
function zoomToPoly(e) {
	map.fitBounds(e.target.getBounds());
	}
	
//	Adds a vector layer showing the project parklands
var parkland	= new L.geoJson.ajax('/woodland/parkland', {
	style: function(feature) {
        switch (feature.properties.Present) {
            case 'yes': return {color: "green"};
            case 'no':  return {color: "brown"};
        }
		fillOpacity: 0.8
    },
	onEachFeature: function(feature, layer) {
		//layer.on({mouseover: highlightparkland,  mouseout: resetparkland, click: zoomToparkland }),
		layer.on({mouseover: highlightPoly,  mouseout: resetPoly, click: zoomToPoly }),
		layer.bindPopup(	'<b>Name: 	</b> '	+ feature.properties.pwp_name + '<br>' +
											'<b>Source: 	</b> '	+ feature.properties.source1txt + '<br>' + 
											'<b>Present:  </b> ' 	+ feature.properties.Present + '<br>' 
						, {maxWidth : 400});
	}
}).addTo(map);
	
//	Adds a vector layer showing the project boundary
var boundary	= new L.geoJson.ajax('/woodland/boundary', {
	style(feature) {
		return { weight: 3, color: 'blue', dashArray: '7' , fill: false};
	}
}).addTo(map);

//	Adds a vector layer showing the major roads
var parish	= new L.geoJson.ajax('/woodland/parish', {
	style(feature) {
		return { weight: 1, color: 'blue', dashArray: '3', fill: false };
	}
}).addTo(map);

// Creation of layer controls to toggle the basemaps and the layers
var baseMaps = {
    "OSM": tile,
	"Topography": topotile};
var overlayMaps = {
    "Woods": Woods,
	"Parkland": parkland,
	"Areas": areas,
	"Boundary": boundary,
	"Parishes": parish};
var controlLayers =	L.control.layers(baseMaps, overlayMaps, {collapsed: false, position: 'topright'}).addTo(map);		

// Adds a scale; both imperial and metric
L.control.scale({ position: 'bottomright' }).addTo(map);

//	adds a welcome box on start up that can be removed on mouse-click; box characteristics are defined in trail.css
var customControl =  L.Control.extend({
	options: {
		position: 'bottomright'
	},
	onAdd: function (map) {
		var container = L.DomUtil.create('div', 'info');
		container.innerHTML = '<h4>Dunsmore Living Landscape Woodland Project</h4>' +  ' <p><small>(click to remove)</small></p>';
		container.onclick = function(){
			map.removeControl(container);
		}
		return container;
	}
});	
map.addControl(new customControl());

//Adds a legend for the wood and parkland; it can be removed on a mouse-click
var legend =  L.Control.extend({
	options: {
		position: 'bottomright'
	},
    onAdd: function (map) {
		var container = L.DomUtil.create('div', 'info legend');
		container.innerHTML = 	'<i legendi style="color:black"></i><strong>Wood and Park Legend</strong><br>' +
									'<p legendi style="background:#00CD00"</p>Still here<br>' +
									'<p legendi style="background:#4876FF" </p>Partly here<br>' +
									'<p legendi style="background:#A0522D"</p>Gone<br>'  +
									'<p><small> (click to remove)</small><p>';
		container.onclick = function(){
			map.removeControl(container);
		}
		return container;
	}
});	
map.addControl(new legend());

// enables centering of the map
var centreControl =  L.Control.extend({
	options: {
		position: 'topright'
	},
	onAdd: function (map) {
		var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-centre');
		container.title = 'Re-centre the Map';
		container.onclick = function(){
			map.setView(new L.LatLng(52.3584,-1.4649), 12);
		}
		return container;
	}
});	
map.addControl(new centreControl());


