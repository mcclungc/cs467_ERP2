/* 
 * CS 467 Senior Project
 * Authors: Terence Berry, Corey Immke, Connie McClung, Alexander Yfraimov
 * File name: app.js
 * Description: Javascript to set up website.
 *
*/

var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'user'}); //default layout is required but can be changed per page.
var bodyParser = require('body-parser');
var request = require('request');
var mysql = require('./db.js');//go to db.js to set up database

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('port', process.argv[2]);//enter in port number when you run

//set up pages and what you can do on those pages
app.get('/', function(req, res){
	//renders index page
	res.render('index');
});  

//Error pages
app.use(function(req,res){
  res.status(404);
  res.render('404', {layout: 'error'}); //changed layout
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
