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
var cookieParser = require('cookie-parser');
var request = require('request');
var mysql = require('./db.js');//go to db.js to set up database

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use('/api', require('./api/login/router'));
app.use('/api', require('./api/users/router'));
app.use('/api', require('./api/org/router'));
app.use('/api', require('./api/awards/router'));
app.use('/api', require('./api/password/router'));
app.use('/api', require('./api/gcharts/router'));
app.use('/api', require('./api/logout/router'));
app.use('/api', require('./api/emailaward/router')); 
app.use("/award", require("./award.js"));
app.set('port', 5000);//enter in port number when you run
app.set('mysql', mysql);

function sessionValidation(cookie) {	
	return new Promise((resolve, reject) => {
		mysql.pool.query("SELECT * FROM sessions WHERE id = ?", [cookie.erp_session], (error, results, fields) => {
			if(error) throw error;

			if(results.length === 0) {
				reject('Session ID Invalid');
			} else {
				resolve(results[0].user_id);
			}
		})
	});
}

//set up pages and what you can do on those pages
app.get('/', function(req, res, next){
	//renders index page
	res.render('index', {layout: 'login', title: 'Login'}); //changed layout
});

app.get('/reset-password', function(req, res, next){
	res.render('reset', {layout: 'login', title: 'Password Reset'});
});


//Admin pages
app.get('/admin', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '1') {
		sessionValidation(req.cookies).then(user_id => {
			res.render('adminHome', {layout: 'admin'});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});

app.get('/admin-account', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '1') {
		sessionValidation(req.cookies).then(user_id => {
			var context = {};
			context.layout = 'admin';
			context.title = '| Account';
			mysql.pool.query('SELECT id, name, email, created_on FROM `users` WHERE id = ?', user_id, function(err, rows, fields) {
				if (err) {
					next(err);
					return;
				}
				var userInfo = {
					'id': rows[0].id,
					'name': rows[0].name,
					'email': rows[0].email,
					'created_on' : rows[0].created_on
				};
				context.user = userInfo;
				res.render('adminAccount', context);
			});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});

app.get('/admin-reports', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '1') {
		sessionValidation(req.cookies).then(user_id => {
			res.render('adminReports', {layout: 'admin', title: '| Reports'});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});

app.get('/admin-usermanagement', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '1') {
		sessionValidation(req.cookies).then(user_id => {
			var context = {};
			context.layout = 'admin';
			context.title = '| User Management';
			mysql.pool.query('SELECT u.id as id, u.name as name, u.email as email, r.region_name as region_name, d.department_name as department_name, u.is_admin as userType, u.created_on as created_on FROM `users` u INNER JOIN `regions` r on u.region_id = r.id INNER JOIN `departments` d on u.department_id = d.id ORDER BY u.id', function(err, rows, fields) {
				if (err) {
					next(err);
					return;
				}
				var userArray = [];
				for (var row in rows) {
					var newItem = {
						'id': rows[row].id,
						'name': rows[row].name,
						'email': rows[row].email,
						'usertype': rows[row].userType,
						'department_name': rows[row].department_name,
						'region_name': rows[row].region_name,
						'created_on' : rows[row].created_on};
					userArray.push(newItem); //Use push to add all the parameters we kept track of
				}
				context.users = userArray;
				res.render('adminUM', context);
			});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});

app.get('/add-user', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '1') {
		sessionValidation(req.cookies).then(user_id => { 
		//This is code to populate dropdowns for departments and regions, but the form doesn't seem to 
		//be posting properly to the API, so I am commenting out until that is resolved.
		//Starts here
			let callbackCount = 0;
			let context = {};
			context.layout = 'admin';
                        context.title = '| Create User';
			let Request = require('request');
			Request.get("http://localhost:5000/api/org/departments", (error, response,body)=> {
				if(error) {
					res.write(JSON.stringify(error));
					res.end();
				}  else{
				context.departments = JSON.parse(body);
				callbackCount++;
			}
			});
			Request.get("http://localhost:5000/api/org/regions", (error, response,body)=> {
				if(error) {
					res.write(JSON.stringify(error));
					res.end();
				} else {
				context.regions = JSON.parse(body);
				callbackCount++;
			}
			if (callbackCount === 2) {
			res.render('adminCreateUser', context);
			}

		});
		//ends, uncomment the line below to restore to original code.
		//res.render('adminCreateUser', {layout: 'admin', title : '| Create User'});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});

app.get('/admin-change-password', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '1') {
		sessionValidation(req.cookies).then(user_id => {
			res.render('adminPassword', {layout: 'admin', title: '| Change Password'});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});


//User pages
app.get('/home', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '0') {
		sessionValidation(req.cookies).then(user_id => {
			res.render('userHome', {layout: 'user', title: 'ERP Dashboard'});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});

app.get('/award', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '0') {
		sessionValidation(req.cookies).then(user_id => {
			res.render('userAward', {layout: 'user', title: 'ERP Awards'});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});
/*
app.get('/history', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '0') {
		sessionValidation(req.cookies).then(user_id => {
			res.render('userHistory', {layout: 'user', title: 'User History'});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});*/
app.get('/history', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '0') {
		sessionValidation(req.cookies).then(user_id => {
			let context = {};
			let Request = require('request');
			Request.get("http://localhost:5000/api/awards", (error, response,body)=> {
				if(error) {
					res.write(JSON.stringify(error));
					res.end();
				}    
				context.awardrecords = JSON.parse(body);
				//console.log(context.awardrecords);
            	res.render('userHistory', context);
				});
			}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});

app.get('/account', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '0') {
		sessionValidation(req.cookies).then(user_id => {
			var context = {};
			context.layout = 'user';
			context.title = 'Account Management';
			mysql.pool.query('SELECT u.id as id, u.name as name, u.email as email, r.region_name as region_name, d.department_name as department_name, u.created_on as created_on FROM `users` u INNER JOIN `regions` r on u.region_id = r.id INNER JOIN `departments` d on u.department_id = d.id WHERE u.id = ?', user_id, function(err, rows, fields) {
				if (err) {
					next(err);
					return;
				}
				var userInfo = {
					'id': rows[0].id,
					'name': rows[0].name,
					'email': rows[0].email,
					'department_name': rows[0].department_name,
					'region_name': rows[0].region_name,
					'created_on' : rows[0].created_on
				};
				context.user = userInfo;
				res.render('userAccount', context);
			});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});

app.get('/change-password', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '0') {
		sessionValidation(req.cookies).then(user_id => {
			res.render('userPassword', {layout: 'user', title: 'Change Password'});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});

app.get('/userhelp', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '0') {
		sessionValidation(req.cookies).then(user_id => {
			res.render('userHelp', {layout: 'user', title: 'User Help'});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});

app.get('/adminhelp', function(req, res, next){
	if(!req.cookies.erp_is_admin) {
		res.redirect('/');
	} else if(req.cookies.erp_is_admin === '1') {
		sessionValidation(req.cookies).then(user_id => {
			res.render('adminHelp', {layout: 'admin', title: 'Admin Help'});
		}).catch(error => {
			res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
});

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
