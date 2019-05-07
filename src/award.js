module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var dateFormat = require('dateformat');
    var fs = require('fs');

    function renderLatexDoc(awardtype,context){         
        var process = require('process');
        process.chdir('public/latexfiles');
         //TO DO CHECK FOR FILE EXISTS, DELETE IF PRESENT
         
        console.log('Current directory: ' + process.cwd());
        
        if (awardtype == 1)
        {
            templateName = 'eomtemplatewithfields.tex';
            //var awardfilename ="eomaward" + context.awardrecord.awardID + ".pdf";
            var awardfilename ="eomtemplatewithfields.pdf";
            context.awardrecord.awardfilename = awardfilename;
            var spawn  = require('child_process').spawn;
            var latex = spawn('pdflatex', [templateName]);
            /*
            fs.rename('eomtemplatewithfields.pdf', awardfilename,  function(err) {
                if ( err ) console.log('ERROR: ' + err);
            });*/
        }
        else if (awardtype ==2)
        {
            templateName = 'eowtemplatewithfields.tex';
            //var awardfilename = "eowaward"+ context.awardrecord.awardID + ".pdf";
            var awardfilename = "eowtemplatewithfields.pdf";
            context.awardrecord.awardfilename = awardfilename;
            var spawn  = require('child_process').spawn;
            var latex = spawn('pdflatex', [templateName]);
            /*
            fs.rename('eowtemplatewithfields.pdf', awardfilename,  function(err) {
                if ( err ) console.log('ERROR: ' + err);
            });*/
        }
        process.chdir('../..');
        console.log('Current directory: ' + process.cwd());
    }

    function writeCSV(data){
        var createCsvWriter = require('csv-writer').createObjectCsvWriter;  
        //set up field names for csv file
        var csvWriter = createCsvWriter({  
            path: "public/latexfiles/awarddata.csv",
            header: [
            {id: "rname", title: "RecipientName"},
            {id: "awarder", title: "Awarder"},
            {id: "awardedon", title: "Date"}
            ]
        });

        //write data to a csv file
        csvWriter  
        .writeRecords(data)
        //.then(()=> console.log('The CSV file ' + path + ' was written successfully.')); 
    }

    //get award types 
    function getAwardTypes(res, mysql, context, complete){
        mysql.pool.query("SELECT id, certificate_type FROM certificates", function(error, results, fields){
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
        mysql.pool.query("SELECT id, name FROM users", function(error, results, fields){
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
        mysql.pool.query("SELECT id, name FROM users", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.awarders = results;
            complete();
        });
    }
    //list all award records - TO DO: filter on current user by session
    function getAwardRecords(res, mysql, context, complete){
        mysql.pool.query("SELECT awards.id as recordID, awards.certificate_id as awardtype, awards.sent_on as date, awards.recipient_name as recipient, awards.recipient_email, users.name as awarder  FROM users INNER JOIN awards on users.id = awards.presenter_id ", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.awardrecords = results;
            for (var i = 0; i < context.awardrecords.length; i++) {
                var newDate = dateFormat(context.awardrecords[i].date, "shortDate");
                context.awardrecords[i].date = newDate;
            }
            complete();
        });
    }

    //get individual award record
    function getAwardRecord(res, mysql, context, id, complete){
        var sql = "SELECT awards.certificate_id as awardtype, awards.id as awardID, awards.sent_on as date, awards.recipient_name as recipient, awards.recipient_email, users.name as awarder  FROM users INNER JOIN awards on users.id = awards.presenter_id WHERE awards.id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            console.log(results[0]);
            context.awardrecord = results[0];
            console.log(context.awardrecord);
            var newDate = dateFormat(context.awardrecord.date, "shortDate");
            context.awardrecord.date = newDate;
            complete();
        });
    }

    //routes
    // page for /award
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        //context.jsscripts = ["deleteawardrecord.js"];
        var mysql = req.app.get('mysql');
        //query tables to populate dropdown lists
        getAwardTypes(res, mysql, context, complete);
        getRecipients(res, mysql, context, complete);
        getAwarders(res, mysql, context, complete);
        getAwardRecords(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 4){
                res.render('createaward', context);
            }
        }
    });

    
    /* Adds an awardrecord*/
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var context = {};
        var sql = "INSERT INTO awards (certificate_id,  recipient_name, recipient_email, presenter_id, sent_on) VALUES (?,?,?,?,?)";
        var inserts = [req.body.awardtype, req.body.recipient_name, req.body.recipient_email,  req.body.awarder, req.body.date];
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

    
    router.get('/:id', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getAwardRecord(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                //console.log(context.awardrecord);
                var newDate = dateFormat(context.awardrecord.date, "longDate");
                var data = [  
                    {
                        rname: context.awardrecord.recipient,
                        awarder: context.awardrecord.awarder,
                        awardedon: newDate
                    }
                    ];
                    writeCSV(data);  
                    renderLatexDoc(context.awardrecord.awardtype,context);
                res.render('previewaward', context);
            }
        }

    });
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM awardrecords WHERE id = ?";
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