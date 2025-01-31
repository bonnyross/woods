var express 	= require('express');
var router 		= express.Router();
var fs 				= require('fs');

router.get('/woodland/woods', function(request, res) {
	var filename = "./public/geojson/woods.geojson";
    fs.readFile(filename, function (err, data) {
		if (err) {console.log("Could not open woods"+ err);} 
		else { res.send( data ); };	}); });
		
router.get('/woodland/parkland', function(request, res) {
	var filename = "./public/geojson/parkland.geojson";
    fs.readFile(filename, function (err, data) {
		if (err) {console.log("Could not open parkland"+ err);} 
		else { res.send( data ); };	}); });
				
router.get('/woodland/area', function(request, res) {
	var filename = "./public/geojson/area.geojson";
    fs.readFile(filename, function (err, data) {
		if (err) {console.log("Could not open area"+ err);} 
		else { res.send( data ); };	}); });

router.get('/woodland/boundary', function(request, res) {
	var filename = "./public/geojson/boundary.geojson";
    fs.readFile(filename, function (err, data) {
		if (err) {console.log("Could not open boundary"+ err);} 
		else { res.send( data ); };	}); });		

router.get('/woodland/parish', function(request, res) {
	var filename = "./public/geojson/parish.geojson";
    fs.readFile(filename, function (err, data) {
		if (err) {console.log("Could not open parish"+ err);} 
		else { res.send( data ); };	}); });

module.exports = router;
