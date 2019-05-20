module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var dateFormat = require('dateformat');
    var fs = require('fs');

    function cleanupOutputDir(){
        //https://stackoverflow.com/questions/27072866/how-to-remove-all-files-from-directory-without-removing-directory-in-node-js/42182416
        var path = require('path');
        var directory = 'public/latexfiles/output';
        console.log('Current directory: ' + process.cwd());
        fs.readdir(directory, (err, files) => {
            if (err) throw err;
          
            for (const file of files) {
              fs.unlink(path.join(directory, file), err => {
               if (err) throw err;
              });
            }
          });
    }

    function renderLatexDoc(awardtype,context){    
       // cleanupOutputDir(); //delete existing files in latex output directory
        //as discussed at https://stackoverflow.com/questions/41560344/how-to-use-a-pdflatex-child-process-to-get-a-pdf-as-a-stream-in-node-js     
        var process = require('process');
        process.chdir('public/latexfiles');  
        //console.log('Current directory: ' + process.cwd());
        if (awardtype == 1)
        {
            templateName = 'eomtemplatewithfields.tex';
            var awardfilename ='eomaward'; 
            context.awardrecord.awardfilename = awardfilename;
            //console.log(context.awardrecord.awardfilename);
            var spawn  = require('child_process').spawn;
            var jobname = '-jobname='+awardfilename;
            var latex = spawn('pdflatex', ['-output-directory', 'output/',jobname, templateName]);
        }
        else if (awardtype ==2)
        {
            templateName = 'eowtemplatewithfields.tex';
            var awardfilename = 'eowaward';
            context.awardrecord.awardfilename = awardfilename;
            var spawn  = require('child_process').spawn;
            var jobname = '-jobname='+awardfilename;
            var latex = spawn('pdflatex', ['-output-directory', 'output/',jobname, templateName]);
        }
        process.chdir('../..');
        //console.log('Current directory: ' + process.cwd());
    }


    function writeCSV(data){
        //https://www.npmjs.com/package/csv-writer
        var createCsvWriter = require('csv-writer').createObjectCsvWriter;  
        //set up field names for csv file
        var csvWriter = createCsvWriter({  
            path: 'public/latexfiles/awarddata.csv',
            header: [
            {id: 'rname', title: 'RecipientName'},
            {id: 'rdept', title: 'RecipientDept'},
            {id: 'awarder', title: 'Awarder'},
            {id: 'awardedon', title: 'Date'}
            ]
        });

        //write data to a csv file
        csvWriter  
        .writeRecords(data)
        .then(()=> console.log('The CSV file ' + csvWriter.path + ' was written successfully.')); 
    }

    //get award types 
    function getAwardTypes(res, mysql, context, complete){
        mysql.pool.query('SELECT id, certificate_type FROM certificates', function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.awardtypes  = results;
            complete();
        });
    }
    //get all employees who could be recipients
    
    function getRecipients(res, mysql, context, complete){
        mysql.pool.query('SELECT id, name FROM users', function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.employees = results;
            complete();
        });
    }

    //get all awarders
    function getAwarders(res, mysql, context, complete){
        mysql.pool.query('SELECT id, name FROM users', function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.awarders = results;
            complete();
        });
    }

    //get all departments
    function getDepartments(res, mysql, context, complete){
        mysql.pool.query('SELECT id, department_name FROM departments', function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.departments = results;
            complete();
        });
    }
    
    //get all regions
    function getRegions(res, mysql, context, complete){
        mysql.pool.query('SELECT id, region_name FROM regions', function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.regions = results;
            complete();
        });
    }
    //list all award records - TO DO: filter on current user by session
    function getAwardRecords(res, mysql, context, complete){
        mysql.pool.query('SELECT awards.certificate_id as awardtypeID, awards.id as awardID, awards.sent_on as date, awards.recipient_name as recipient, awards.recipient_email, awards.recipient_department_id as department, awards.recipient_region_id as region, users.name as awarder, departments.department_name as department_name, certificates.certificate_type as awardtype, regions.region_name as region_name FROM users INNER JOIN awards on users.id = awards.presenter_id INNER JOIN departments on awards.recipient_department_id = departments.id INNER JOIN certificates on awards.certificate_id = certificates.id INNER JOIN regions on awards.recipient_region_id = regions.id ORDER BY awards.id ASC', 
        function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.awardrecords = results;
            for (var i = 0; i < context.awardrecords.length; i++) {
                var newDate = dateFormat(context.awardrecords[i].date, 'shortDate');
                context.awardrecords[i].date = newDate;
            }
            complete();
        });
    }

    //get individual award record
    function getAwardRecord(res, mysql, context, id, complete){
        var sql = 'SELECT awards.certificate_id as awardtypeID, awards.id as awardID, awards.sent_on as date, awards.recipient_name as recipient, awards.recipient_email, awards.recipient_department_id as department, awards.recipient_region_id as region, users.name as awarder, departments.department_name as department_name, certificates.certificate_type as awardtype, regions.region_name as region_name FROM users INNER JOIN awards on users.id = awards.presenter_id INNER JOIN departments on awards.recipient_department_id = departments.id INNER JOIN certificates on awards.certificate_id = certificates.id INNER JOIN regions on awards.recipient_region_id = regions.id WHERE awards.id  = ? ';
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            //console.log(results[0]);
            context.awardrecord = results[0];
            //console.log(context.awardrecord);
            var newDate = dateFormat(context.awardrecord.date, 'shortDate');
            context.awardrecord.date = newDate;
            complete();
        });
    }

    //routes
    // page for /award
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};

        var mysql = req.app.get('mysql');
        //query tables to populate dropdown lists
        getAwardTypes(res, mysql, context, complete);
        getRecipients(res, mysql, context, complete);
        getAwarders(res, mysql, context, complete);
        getDepartments(res, mysql, context, complete);
        getRegions(res, mysql, context, complete);
        getAwardRecords(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 6){
                res.render('userAward', context);
            }
        }
    });

    
    /* Adds an awardrecord*/
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var context = {};
        var sql = 'INSERT INTO awards (certificate_id,  recipient_name, recipient_email, recipient_department_id, recipient_region_id, presenter_id, sent_on) VALUES (?,?,?,?,?,?,?)';
        var inserts = [req.body.awardtype, req.body.recipient_name, req.body.recipient_email, req.body.department, req.body.region,  req.body.awarder, req.body.date];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                context.results = results;
                res.redirect('/award');
            }
        });

    });

    //filter one award 
    router.get('/:id', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['public/js/deleteawardrecord.js'];
        getAwardRecord(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                //console.log(context.awardrecord);
                var newDate = dateFormat(context.awardrecord.date, 'longDate');
                var data = [  
                    {
                        rname: context.awardrecord.recipient,
                        rdept: context.awardrecord.department_name,
                        awarder: context.awardrecord.awarder,
                        awardedon: newDate
                    }
                    ];
                    writeCSV(data);  
                    renderLatexDoc(context.awardrecord.awardtypeID,context);
                	res.render('previewaward', context);
            }
        }

    });
    //delete one award record
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = 'DELETE FROM awardrecords WHERE id = ?';
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })
    return router;
}();
