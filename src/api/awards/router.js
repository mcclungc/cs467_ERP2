
const express = require('express');
const router = express.Router();
const db = require('../../db');
const sessionValidation = require('../../session');
const Joi = require('@hapi/joi');
const fs = require('fs');
var dateFormat = require('dateformat');

//retrieves signature blob from user record, saves as image file in latexfiles dir and returns filename
function getPresenterSig(req,res){
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
        return;
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            const sql = 'SELECT * from users where users.id = ?';
            let inserts = [req.params.id];
            db.pool.query(sql, inserts, (error, results, fields) => {
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                } else if(results.length == 0 ){
                    res.status(200).json({}).send();
                } else {
                    let data = [];

                    //create buffer from blob binary
                    const buf = Buffer.from(results[0].signature);
                    const testfiletype = buf.toString('hex',0,4);
                    //console.log(testfiletype);
                    var message;
                    if (testfiletype === "89504e47")
                    {
                        fs.writeFileSync('public/latexfiles/outputsig.png', buf);
                        message = "File created and saved as public/latexfiles/outputsig.png";
                        data.push({
                            "sigfilename": "outputsig.png",
                            });
                    }
                    else if (testfiletype === "ffd8ffe0")
                    {
                        fs.writeFileSync('public/latexfiles/outputsig.jpg', buf);
                        message = "File created and saved as public/latexfiles/outputsig.jpg";
                        data.push({
                            "sigfilename": "outputsig.jpg",
                        });
                    }
                    //Write new file out:
                    console.log(message);
                    res.status(200).send(data);
                }
            });
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        });    
    }  
}

//list all award records 
function getAwards(req,res){  
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
        return;
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            const sql = 'SELECT awards.certificate_id as awardtypeID, awards.id as awardID, awards.sent_on as date, awards.recipient_name as recipient, awards.recipient_email as recipient_email, awards.recipient_department_id as department, awards.recipient_region_id as region, users.name as presenter, departments.department_name as department_name, certificates.certificate_type as awardtype, regions.region_name as recipient_region FROM users INNER JOIN awards on users.id = awards.presenter_id INNER JOIN departments on awards.recipient_department_id = departments.id INNER JOIN certificates on awards.certificate_id = certificates.id INNER JOIN regions on awards.recipient_region_id = regions.id ORDER BY awards.id ASC';
    
            db.pool.query(sql, (error, results, fields) => {
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                } else if(results.length == 0 ){
                    res.status(200).json({}).send();
                } else {
                    let data = [];
                    results.forEach(element => {
                        data.push({
                            "awardID": element.awardID,
                            "awardtype": element.awardtype,
                            "awardtypeID": element.awardtypeID,
                            "recipient":element.recipient,
                            "recipient_email": element.recipient_email,
                            "recipient_department": element.department_name,
                            "recipient_region": element.recipient_region,
                            "presenter": element.presenter,
                            "award_date": dateFormat(element.date, 'shortDate')
                        });
                    });
                    res.status(200).send(data);
                }
            });
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        });
    }
}

//list all award records for current user by session
function getAwardsCurrentUser(req,res){  
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
        return;
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            const sql = 'SELECT awards.certificate_id as awardtypeID, awards.id as awardID, awards.sent_on as date, awards.recipient_name as recipient, awards.recipient_email as recipient_email, awards.presenter_id as presenter_id, awards.recipient_department_id as department, awards.recipient_region_id as region, users.name as presenter, departments.department_name as department_name, certificates.certificate_type as awardtype, regions.region_name as recipient_region FROM users INNER JOIN awards on users.id = awards.presenter_id INNER JOIN departments on awards.recipient_department_id = departments.id INNER JOIN certificates on awards.certificate_id = certificates.id INNER JOIN regions on awards.recipient_region_id = regions.id WHERE awards.presenter_id  = ? ORDER BY awards.id ASC';
            let inserts = [req.params.id];
            db.pool.query(sql, inserts, (error, results, fields) => {
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                } else if(results.length == 0 ){
                    res.status(200).json({}).send();
                } else {
                    let data = [];
                    results.forEach(element => {
                        data.push({
                            "awardID": element.awardID,
                            "awardtype": element.awardtype,
                            "awardtypeID": element.awardtypeID,
                            "recipient":element.recipient,
                            "recipient_email": element.recipient_email,
                            "recipient_department": element.department_name,
                            "recipient_region": element.recipient_region,
                            "presenter": element.presenter,
                            "award_date": dateFormat(element.date, 'shortDate')
                        });
                    });
                    res.status(200).send(data);
                }
            });
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        });
    }
}

//get individual award record
function getAward(req,res){
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
        return;
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            const sql = 'SELECT awards.certificate_id as awardtypeID, awards.id as awardID, awards.sent_on as date, awards.recipient_name as recipient, awards.recipient_email as recipient_email, awards.presenter_id as presenter_id, awards.recipient_department_id as department, awards.recipient_region_id as region, users.name as presenter, departments.department_name as department_name, certificates.certificate_type as awardtype, regions.region_name as recipient_region FROM users INNER JOIN awards on users.id = awards.presenter_id INNER JOIN departments on awards.recipient_department_id = departments.id INNER JOIN certificates on awards.certificate_id = certificates.id INNER JOIN regions on awards.recipient_region_id = regions.id WHERE awards.id  = ? ORDER BY awards.id ASC';
            let inserts = [req.params.id];
            db.pool.query(sql,inserts, (error, results, fields) => {
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                } else if(results.length == 0 ){
                    res.status(200).json({}).send();
                } else {
                let data = [];
                    data.push({
                    "awardID": results[0].awardID,
                    "awardtype": results[0].awardtype,
                    "awardtypeID": results[0].awardtypeID,
                    "recipient":results[0].recipient,
                    "recipient_email": results[0].recipient_email,
                    "recipient_department": results[0].department_name,
                    "recipient_region": results[0].recipient_region,
                    "presenter": results[0].presenter,
                    "presenter_id": results[0].presenter_id,
                    "award_date": dateFormat(results[0].date, 'shortDate')
                    });
                    res.status(200).send(data);
                }
            });
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        });
    }
}

//get individual award record
function createAwardRecord(req,res){
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
        return;
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            if(userData.is_admin === 0) {
                const schema = Joi.object().keys ({
                    certificate_id: Joi.number().positive().integer().required(),
                    recipient_name: Joi.string().max(255).trim().required(),
                    recipient_email: Joi.string().max(256).email().required(),
                    recipient_department_id: Joi.number().positive().integer().required(),
                    recipient_region_id: Joi.number().positive().integer().required(),
                    sent_on: Joi.date().required()
                });
            
                Joi.validate(req.body, schema, (err, value) => {
                    if (err) {
                        res.status(400).json({ 'message': err.details[0].message }).send();
                        return;
                    } else {
                        db.pool.query('SELECT signature FROM users WHERE id = ?', [userData.user_id], (error, results, fields) => {
                            if(error) throw error;
                            
                            if(results.length === 0) {
                                res.status(401).json({ 'message': 'Invalid User' }).send();
                                return;
                            }

                            if(!results[0].signature) {
                                res.status(401).json({ 'message': 'Missing Signature' }).send();
                                return;
                            }

                            var sql = 'INSERT INTO awards (certificate_id,  recipient_name, recipient_email, recipient_department_id, recipient_region_id, presenter_id, sent_on) VALUES (?,?,?,?,?,?,?)';
                            var inserts = [req.body.certificate_id, req.body.recipient_name, req.body.recipient_email, req.body.recipient_department_id, req.body.recipient_region_id,  userData.user_id, req.body.sent_on];
                            db.pool.query(sql,inserts, (error, results, fields) => {
                                if(error) throw error;
                                else {
                                    let data = [];
                                    data.push({
                                        "awardID": results.insertId,
                                        "awardtypeID": req.body.certificate_id,
                                        "recipient_name":req.body.recipient_name,
                                        "recipient_email": req.body.recipient_email,
                                        "recipient_department_id": req.body.recipient_department_id,
                                        "recipient_region_id": req.body.recipient_region_id,   
                                        "presenter_id": userData.user_id,            
                                        "award_date": req.body.sent_on
                                    });
                                    res.status(200).send(data);
                                }
                            });
                        });
                    }
                });
            } else {
                res.status(401).json({ 'message': 'Invalid User' }).send();
                return;
            }
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        })
    }
}

function deleteAwardRecord(req, res) {
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
        return;
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            if(userData.is_admin === 0) {
                db.pool.query("DELETE FROM awards WHERE id = ?", [req.params.id], (error, results, fields) => {
                    if(error) throw error;
                    let data = [];
                    data.push({
                        "message": "Award record with ID " + req.params.id + " has been deleted",
                    });
                    res.status(204).send(data);
                });
            } else {
                res.status(401).json({ 'message': 'Invalid User' }).send();
                return;
            }
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        });
    }        
}

//routes
router.get('/awards', getAwards);
router.get('/awards_currentuser/:id', getAwardsCurrentUser);
router.get('/awards/:id', getAward);
router.get('/awards_presenter_sig/:id', getPresenterSig);

router.post('/awards', createAwardRecord);
router.delete('/awards/:id', deleteAwardRecord);

module.exports = router;
