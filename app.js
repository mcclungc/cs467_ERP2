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
app.set('mysql', mysql);


//set up pages and what you can do on those pages
app.get('/', function(req, res, next){
	//used to create dynamic metaTags
	res.locals.metaTags = {
		title: "Login"
	};
	//renders index page
	res.render('index', {layout: 'login'}); //changed layout
});

app.get('/reset-password', function(req, res, next){
	res.locals.metaTags = {
		title: "Password Reset"
	};
	res.render('reset', {layout: 'login'});
});  

//Admin pages
app.get('/admin', function(req, res, next){
	res.render('adminHome', {layout: 'admin'});
});

app.get('/admin-account', function(req, res, next){
	res.locals.metaTags = {
		title: "| Account"
	};
	res.render('adminAccount', {layout: 'admin'});
});

app.get('/admin-reports', function(req, res, next){
	res.locals.metaTags = {
		title: "| Reports"
	};
	res.render('adminReports', {layout: 'admin'});
});

app.get('/admin-usermanagement', function(req, res, next){
	res.locals.metaTags = {
		title: "| User Management"
	};
	res.render('adminUM', {layout: 'admin'});
});

app.get('/add-user', function(req, res, next){
	res.locals.metaTags = {
		title: "| Create User"
	};
	res.render('adminCreateUser', {layout: 'admin'});
});

app.get('/admin-change-password', function(req, res, next){
	res.locals.metaTags = {
		title: "| Change Password"
	};
	res.render('adminPassword', {layout: 'admin'});
});

//User pages
app.get('/home', function(req, res, next){
	res.locals.metaTags = {
		title: "ERP Dashboard"
	};
	res.render('userHome', {layout: 'user'});
});

app.get('/create-awards', function(req, res, next){
	res.locals.metaTags = {
		title: "ERP Awards"
	};
	res.render('userAward', {layout: 'user'});
	//res.render('createaward', {layout: 'user'});
});

app.get('/history', function(req, res, next){
	res.locals.metaTags = {
		title: "User History"
	};
	res.render('userHistory', {layout: 'user'});
});

app.get('/account', function(req, res, next){
	res.locals.metaTags = {
		title: "Account Management"
	};
	res.render('userAccount', {layout: 'user'});
});

app.get('/change-password', function(req, res, next){
	res.locals.metaTags = {
		title: "| Change Password"
	};
	res.render('userPassword', {layout: 'user'});
});


//award routes handled by award.js
app.use("/award", require("./award.js"));

//Error pages
app.use(function(req, res, next){
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

module.exports = app; //required for dynamic meta tags
