module.exports = function(){
    const express = require('express');
    const router = express.Router();
    const dateFormat = require('dateformat');
    const fs = require('fs');
    const Request = require('request');
    const URL = require('url');	
    const latexmodule = require('./latexmodule'); //moved latex functions to separate module


    //API Call Wrapper Functions - I am trying to consolidate to 1 function
    function callAPIAwardRecords(url, context,  complete){
        Request.get(url, (error, response,body)=> {
            if(error) {
                res.write(JSON.stringify(error));
                res.end();
            }    
            context.awardrecords = JSON.parse(body);
            complete();
        });
    }

    function callAPIAwardTypes(url, context, complete){
        Request.get(url, (error, response,body)=> {
            if(error) {
                res.write(JSON.stringify(error));
                res.end();
            }    
            context.awardtypes = JSON.parse(body);
            complete();
        });
    }

    function callAPIDepartments(url, context, complete){
        Request.get(url, (error, response,body)=> {
            if(error) {
                res.write(JSON.stringify(error));
                res.end();
            }    
             context.departments = JSON.parse(body);
            complete();
        });
    }

    function callAPIRegions(url, context, complete){
        Request.get(url, (error, response,body)=> {
            if(error) {
                res.write(JSON.stringify(error));
                res.end();
            }    
            context.regions = JSON.parse(body);
            complete();
        });
    }

    function callAPIPresenters(url, context, complete){
        Request.get(url, (error, response,body)=> {
            if(error) {
                res.write(JSON.stringify(error));
                res.end();
            }    
            context.presenters = JSON.parse(body);
            complete();
        });
    }
    
    function callAPIAwardRecord(url, context, complete){//not working yet
        Request.get(url, (error, response,body)=> {
            if(error) {
                res.write(JSON.stringify(error));
                res.end();
            }  
            //console.log(body);  
            context.awardrecord = JSON.parse(body);
            //console.log(context.awardrecord);
            complete();
        });
    }

    function callAPIPresenterSig(url, context, complete){//not working yet
        Request.get(url, (error, response,body)=> {
            if(error) {
                res.write(JSON.stringify(error));
                res.end();
            }  
            //console.log(JSON.parse(body));
            context.siginfo = JSON.parse(body);
            complete();
        });
    }
   
   
    //routes
    // page for /award
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {}; 
        context.layout = 'user';
        context.title = 'ERP Awards';
        callAPIAwardTypes("http://localhost:5000/api/awards_types", context, complete);
        callAPIPresenters("http://localhost:5000/api/awards_presenters",  context,  complete);
        callAPIDepartments("http://localhost:5000/api/awards_departments",  context,  complete);
        callAPIRegions("http://localhost:5000/api/awards_regions", context,  complete);
        callAPIAwardRecords("http://localhost:5000/api/awards", context,  complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 5){
                res.render('userAward', context);
            }
        }
    });

       
    //add an award record TO DO: MOVE TO API CALL  
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var context = {};
        context.layout = 'user';
        context.title = 'ERP Awards';
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

     //filter one award calling API
    router.get('/:id', function(req, res){
        let callbackCount = 0;
	let hostName = req.headers.host; 
        let context = {};
        //push options for handlebar view
	    context.layout = 'user';
        context.title = 'ERP Award Preview';
        //push js for delete button
        context.jsscripts = [hostName + 'public/js/deleteawardrecord.js'];
        context.css = [hostName + 'public/css/table.css', hostName + 'public/userMain.css'];
        //push js for email button
        //get award record data for rendering latex award file
        const url = "http://localhost:5000/api/awards/"+ req.params.id;
        //console.log(url);
        callAPIAwardRecord(url, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount === 1){   
                //console.log("presenter id is " + context.awardrecord[0].presenter_id); 
                //get presenter sig and sig file name
                const presentersigurl = "http://localhost:5000/api/awards_presenter_sig/"+ context.awardrecord[0].presenter_id; 
                callAPIPresenterSig(presentersigurl, context, complete);
            }
            else if (callbackCount === 2){
               // console.log(context.siginfo[0].sigfilename);
                var awarddata = [  
                    {
                        rname: context.awardrecord[0].recipient,
                        rdept: context.awardrecord[0].recipient_department,
                        rregion: context.awardrecord[0].recipient_region,
                        awarder: context.awardrecord[0].presenter,
                        awardedon: context.awardrecord[0].award_date,
                        sigfile: context.siginfo[0].sigfilename
                       // sigfile: "outputsig.png"
                    }
                ]; 
                //create award data file csv
                //console.log(awarddata);
                latexmodule.writeCSV(awarddata); 
                //render latex file and save in dictionary
                latexmodule.renderLatexDoc(context.awardrecord[0].awardtypeID, context, complete);
            }
            else if (callbackCount === 3){
                res.render('origpreviewaward', context);
            }
        }  
    });


    //delete one award record TO DO: USE API CALL
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
