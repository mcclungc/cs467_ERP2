module.exports = function(){
    const express = require('express');
    const router = express.Router();
    const dateFormat = require('dateformat');
    const fs = require('fs');
    const Request = require('request');
    const URL = require('url');	
    const latexmodule = require('./latexmodule'); //moved latex functions to separate module
    const sessionValidation = require('./session');


    //API Call Wrapper Functions 
    function callAPIAwardRecord(url, sessionCookie, context, complete) {
        const request = Request.defaults({jar: true});
        var cookie = request.cookie('erp_session=' + sessionCookie);
        const options = {
            url: url,
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

            context.awardrecord = JSON.parse(body);
            complete();
        });
    }

    function callAPIPresenterSig(url, sessionCookie, context, complete) {
        const request = Request.defaults({jar: true})
        var cookie = request.cookie('erp_session=' + sessionCookie);
        const options = {
            url: url,
            headers: {
                'Cookie': cookie
            },
            method: 'GET'
        }

        request(options, (error, response,body) =>  {
            if(error) {
                res.write(JSON.stringify(error));
                res.end();
            }  
            context.siginfo = JSON.parse(body);
            complete();
        });
    }


     //filter one award calling API
    router.get('/:id', function(req, res){
        if(!req.cookies.erp_session) {
            res.status(401).json({ 'message': 'Invalid User' }).send();
            return;
        } else {
            sessionValidation(req.cookies.erp_session).then(userData => {
                if(userData.is_admin === 0) {
                    let callbackCount = 0;
                    let hostName = req.headers.host; 
                    let context = {};
                    //push options for handlebar view
                    context.layout = 'user';
                    context.title = 'ERP Award Preview';
                    context.css = [hostName + 'public/css/table.css', hostName + 'public/userMain.css'];
                    //get award record data for rendering latex award file
                    const url = "http://localhost:5000/api/awards/"+ req.params.id;
                    callAPIAwardRecord(url, req.cookies.erp_session, context, complete);
                    function complete(){
                        callbackCount++;
                        if(callbackCount === 1){   
                            //get presenter sig and sig file name
                            const presentersigurl = "http://localhost:5000/api/awards_presenter_sig/"+ context.awardrecord[0].presenter_id; 
                            callAPIPresenterSig(presentersigurl, req.cookies.erp_session, context, complete);
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
                                }
                            ]; 
                            //create award data file csv
                            latexmodule.writeCSV(awarddata, complete); 

                        }                 
                        else if (callbackCount === 3){
                             //render latex file and save in directory
                            latexmodule.renderLatexDoc(context.awardrecord[0].awardtypeID, context, complete);
                        }
                        else if (callbackCount === 4){                   
                            res.status(200).send();
                        }

                    } 
                } else {
                    res.status(401).json({ 'message': 'Invalid User' }).send();
                    return;
                }
            }).catch(error => {
                res.status(401).json({ 'message': error }).send();
            })
        }
    });

    return router;
}();
