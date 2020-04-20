//
//	Displays a map 
//	Uses the Leaflet package with geojson inputs obtained through ajax calls to node.js
//
//	Creates map area
var map = L.map('map', {
	center: [52.3584,-1.4649],
	maxZoom: 15,
	zoom: 12
});

// prepare all other layers, adding tile and categories to start with //////////
//var tile = L.tileLayer('./osmtiles/{z}/{x}/{y}.png',{attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'}).addTo(map);	
var tile = L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: ['a','b','c'],
	opacity: 0.75
}).addTo( map );

//	Adds a basemap
/*var imageUrl = '/woodland/map', 
	imageBounds = [[52.281405911,-1.576311548],[52.435227039,-1.354224667]];
var tile = L.imageOverlay(imageUrl, imageBounds).addTo(map);
tile.setOpacity(0.5);
*/

//	Adds an attribution bottom right
var attrib = L.control.attribution({options: {
		position: 'bottomleft'
	},prefix: '<a href="http://www.stretton-on-dunsmore-history.org.uk">Stretton History Society website   </a>'}).addTo(map);

//	Adds a vector layer showing the trail to be followed
var areas	= new L.geoJson.ajax('/woodland/area', {
	style(feature) {
		return { color: 'red', fill: true, fillOpacity: 0 };
	},
	onEachFeature: function(feature, layer) {
		layer.on({click: zoomToArea}),
		layer.bindTooltip('<h4>Area:  <span>' +feature.properties.Area + '</span> </h4>', {permanent: false, interactive: true, className: 'labelstyle'});
	}
}).addTo(map);

function zoomToArea(e) {
	map.fitBounds(e.target.getBounds());
	displayArea(e.target.feature.properties.Area);
	}

//	Adds a vector layer showing the trail to be followed
var Woods = new L.geoJson.ajax('/woodland/woods', {
	style: function(feature) {
        switch (feature.properties.Present) {
            case 'yes': return {color: "green"};
            case 'no':   return {color: "brown"};
			case 'pt':   return {color: "blue"};
        }
		fillOpacity: 0.8
    },
	onEachFeature: function(feature, layer) {
		layer.on({mouseover: highlightWoods, mouseout: resetWoods, click: zoomToWoods }),
		layer.bindPopup('<h4>Name: </h4> '		+ feature.properties.name + '<br>' +
						'<h4>Old Name: </h4> ' 			+ feature.properties.OldName + '<br>' + 
						'<h4>Description: </h4> ' 			+ feature.properties.OldDesc + '<br>' +
						'<h4>Source: </h4> '	+ feature.properties.OldSource + '<br>' +
						'<h4>Area: </h4> '	+ feature.properties.Area + '<br>' +
						'<h4>Present: </h4> '	+ feature.properties.Present + '<br>' //+
						//'<h4>OS 1888: </h4> '	+ feature.properties.OS 1888 + '<br>'
						, {width : 300});
	}
}).addTo(map);

// create mouse functions and style
function highlightWoods(e) {
	var layer = e.target;
	layer.setStyle({weight: 5, color: '#666', dashArray: '', fillOpacity: 0.7});
	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();}}	
function resetWoods(e) {
		Woods.resetStyle(e.target);}
function zoomToWoods(e) {
	map.fitBounds(e.target.getBounds());}

//	Adds a vector layer showing the trail to be followed
var parkland	= new L.geoJson.ajax('/woodland/parkland', {
	style: function(feature) {
        switch (feature.properties.Present) {
            case 'yes': return {color: "green"};
            case 'no':   return {color: "brown"};
        }
		fillOpacity: 0.8
    },
	onEachFeature: function(feature, layer) {
		layer.on({mouseover: highlightparkland,  mouseout: resetparkland, click: zoomToparkland }),
		layer.bindPopup('<h4>Name: </h4> '				+ feature.properties.pwp_name + '<br>' +
						'<h4>Source: </h4> <a href="' 			+ feature.properties.source1txt + '" target = _Area"</a><br>' + 
						'<h4>Still present: </h4> ' 	+ feature.properties.Present + '<br>' 
						, {width : 300});
	}
}).addTo(map);
// create mouse functions and style
function highlightparkland(e) {
	var layer = e.target;
	layer.setStyle({weight: 5, color: '#666', dashArray: '1', fillOpacity: 0.7});
	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();}}	
		
function resetparkland(e) {
		parkland.resetStyle(e.target);}
		
function zoomToparkland(e) {
	map.fitBounds(e.target.getBounds());}
	
//	Adds a vector layer showing the trail to be followed
var boundary	= new L.geoJson.ajax('/woodland/boundary', {
	style(feature) {
		return { weight: 3, color: 'red', dashArray: '7' , fill: false};
	}
}).addTo(map);

//	Adds a vector layer showing the trail to be followed
var roads	= new L.geoJson.ajax('/woodland/roads', {
	style(feature) {
		return { weight: 2, color: 'black', dashArray: '1' };
	}
}).addTo(map);

// Creation of layer controls ////////////////////////////////
var baseMaps = {
    "OSM": tile };
var overlayMaps = {
    "Woods": Woods,
	"Parkland": parkland,
	"Areas": areas,
	"Boundary": boundary,
	"Roads": roads};
var controlLayers =	L.control.layers(baseMaps, overlayMaps, {collapsed: false, position: 'topright'}).addTo(map);		

//	adds a welcome box on start up that is removed on mouse-click; box characteristics are defined in trail.css
var customControl =  L.Control.extend({
	options: {
		position: 'bottomright'
	},
	onAdd: function (map) {
		var container = L.DomUtil.create('div', 'info');
		container.innerHTML = '<h4>Dunsmore Living Landscape Woodland Project</h4>' +  ' </p>';
		container.onclick = function(){
			map.removeControl(container);
		}
		return container;
	}
});	
map.addControl(new customControl());

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
	div.innerHTML = 	'<i legendi style="color:black"></i><strong>Wood and Park Legend</strong><br>' +
									'<p legendi style="background:#98FB98"</p>Still here<br>' +
									'<p legendi style="background:#87CEFA"  </p>Partly here<br>' +
									'<p legendi style="background:#A0522D"  </p>Gone<br>' ;
	return div;
};
legend.addTo(map);

function getColor(d) {
    if (d ===  1) return  '#800026';
    if (d === 2) return  '#E31A1C' ;
    if (d ===  3) return  '#FFEDA0';
}

/*function displayArea(areaParam){
	$.ajax({
					url:	'/woodland/pdfs',
					type: "GET",
					success: function (txtBack) { 
						console.log(txtBack);
						myjson = txtBack;
					}
				}); 
				return(myjson);
}*/

function displayArea(areaParam){
	var req = new XMLHttpRequest();
	var url =  'pdfs/Area' + areaParam + '.pdf';
	req.open("GET", url, true);
	req.responseType = "blob";
	req.onload = function (event) {
		var blob = req.response;
		if (window.navigator && window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveOrOpenBlob(blob);  
		}
		else {
			var objectUrl = URL.createObjectURL(blob);
			window.open(objectUrl,"Woodland Area").focus();  
		}
  };
  req.send();
}



