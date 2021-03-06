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
var Request = require('request');
var mysql = require('./db.js');//go to db.js to set up database
var sessionValidation = require('./session');

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
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 1) {
				res.render('adminHome', {layout: 'admin'});
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			res.redirect('/');
		})
	}
});

app.get('/admin-account', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 1) {
				var context = {};
				context.layout = 'admin';
				context.title = '| Account';
				mysql.pool.query('SELECT id, name, email, created_on FROM `users` WHERE id = ?', userData.user_id, function(err, rows, fields) {
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
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			res.redirect('/');
		})
	}
});

app.get('/admin-reports', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 1) {
				res.render('adminReports', {layout: 'admin', title: '| Reports'});
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			res.redirect('/');
		})
	}
});

app.get('/admin-usermanagement', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 1) {
				var context = {};
				context.layout = 'admin';
				context.title = '| User Management';
				mysql.pool.query(`SELECT u.id as id, u.name as name, u.email as email, r.region_name as region_name, d.department_name as department_name, u.is_admin as userType, u.created_on as created_on FROM users u LEFT JOIN regions r on u.region_id = r.id LEFT JOIN departments d on u.department_id = d.id WHERE u.id != ${userData.user_id} ORDER BY is_admin, u.id`, function(err, rows, fields) {
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
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			res.redirect('/');
		})
	}
});

app.get('/add-user', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 1) {
				res.render('adminCreateUser', {layout: 'admin', title : '| Create User'});
			} else {
				res.redirect('/');
			}
		}).catch(error => {
			res.redirect('/');
		})
	}
});

app.get('/admin-change-password', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 1) {
				res.render('adminPassword', {layout: 'admin', title: '| Change Password'});
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			res.redirect('/');
		})
	}
});


//User pages
app.get('/home', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 0) {
				res.render('userHome', {layout: 'user', title: 'ERP Dashboard'});
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			res.redirect('/');
		})
	}
});

app.get('/award', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 0) {
				res.render('userAward', {layout: 'user', title: 'ERP Awards', userID: userData.user_id});
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			res.redirect('/');
		})
	}
});

app.get('/history', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 0) {
				let context = {};
				context.layout = 'user';
				context.title = 'Award History';
				const request = Request.defaults({jar: true})
				var cookie = request.cookie('erp_session=' + req.cookies.erp_session);
				const options = {
					url: "http://localhost:5000/api/awards_currentuser/" + userData.user_id,
					headers: {
						'Cookie': cookie
					},
					method: 'GET'
				}
				request(options, (error, response,body) => {
					if(error) {
						res.write(JSON.stringify(error));
						res.end();
					}    
					context.awardrecords = JSON.parse(body);
					res.render('userHistory', context);
				});
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			console.log(error);
		})
	}
});

app.get('/account', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 0) {
				var context = {};
				context.layout = 'user';
				context.title = 'Account Management';
				mysql.pool.query('SELECT u.id as id, u.name as name, u.email as email, r.region_name as region_name, d.department_name as department_name, u.created_on as created_on FROM `users` u INNER JOIN `regions` r on u.region_id = r.id INNER JOIN `departments` d on u.department_id = d.id WHERE u.id = ?', userData.user_id, function(err, rows, fields) {
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
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			res.redirect('/');
		})
	}
});

app.get('/change-password', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 0) {
				res.render('userPassword', {layout: 'user', title: 'Change Password'});
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			res.redirect('/');
		})
	}
});

app.get('/userhelp', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 0) {
				res.render('userHelp', {layout: 'user', title: 'User Help'});
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			res.redirect('/');
		})
	}
});

app.get('/adminhelp', function(req, res, next){
	if(!req.cookies.erp_session) {
		res.redirect('/');
	} else {
		sessionValidation(req.cookies.erp_session).then(userData => {
			if(userData.is_admin === 1) {
				res.render('adminHelp', {layout: 'admin', title: 'Admin Help'});
			} else {
				res.redirect('/');
			}	
		}).catch(error => {
			res.redirect('/');
		})
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
