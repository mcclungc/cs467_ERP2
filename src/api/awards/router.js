
const express = require('express');
const router = express.Router();
const db = require('../../db');
const Joi = require('@hapi/joi');

//get award types 
function getAwardTypes(req,res){
    const sql = 'SELECT * FROM certificates ORDER BY certificates.id ASC';
    db.pool.query(sql, (error, results, fields) => {
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        } else if(results.length == 0 ) {
            res.status(200).json({}).send();
        } else {
            let data = [];
            results.forEach(element => {
                data.push({
                    "id": element.id,
                    "certificate_type": element.certificate_type
                });
            });
            res.status(200).send(data);
        } 
    });
}      

//get all users who can issue awards //TO DO, filter out admin account
function getPresenters(req,res){
    const sql = 'SELECT users.id as id, users.name as name, users.region_id as presenter_region_id, users.department_id as presenter_department_id , signature, regions.region_name as presenter_region, departments.department_name as presenter_department FROM users INNER JOIN regions on region_id = regions.id INNER JOIN departments on department_id = departments.id WHERE is_admin  = 0 ORDER BY users.id';
    let inserts = 1;
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
                    "id": element.id,
                    "name": element.name,
                    "presenter_region": element.presenter_region,
                    "presenter_department": element.presenter_department
                });
            });
            res.status(200).send(data);
        }
    });
} 

//get all departments
function getDepartments(req,res){
    const sql = 'SELECT * FROM departments ORDER BY departments.id ASC';
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
                    "id": element.id,
                    "department_name": element.department_name
                });
            });
            res.status(200).send(data);
        } 
    });
}

//get all regions
function getRegions(req,res){
    const sql = 'SELECT * FROM regions ORDER BY regions.id ASC';
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
                    "id": element.id,
                    "region_name": element.region_name
                });
            });
            res.status(200).send(data);
        }
    });
}
//list all award records - TO DO: filter on current user by session
function getAwards(req,res){  
    const sql = 'SELECT awards.certificate_id as awardtypeID, awards.id as awardID, awards.sent_on as date, awards.recipient_name as recipient, awards.recipient_email as recipient_email, awards.recipient_department_id as department, awards.recipient_region_id as region, users.name as awarder, departments.department_name as department_name, certificates.certificate_type as awardtype FROM users INNER JOIN awards on users.id = awards.presenter_id INNER JOIN departments on awards.recipient_department_id = departments.id INNER JOIN certificates on awards.certificate_id = certificates.id ORDER BY awards.id ASC';
    //const sql = 'SELECT * from awards';
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
                    "award_date": element.date
                });
            });
            res.status(200).send(data);
        }
    });
}

//get individual award record
function getAward(req,res,mysql){
    const sql = 'SELECT awards.certificate_id as awardtypeID, awards.id as awardID, awards.sent_on as date, awards.recipient_name as recipient, awards.recipient_email as recipient_email, awards.recipient_department_id as department_id, awards.recipient_region_id as region, users.name as awarder, departments.department_name as department, certificates.certificate_type as awardtype, region_name as region FROM users INNER JOIN awards on users.id = awards.presenter_id INNER JOIN departments on awards.recipient_department_id = departments.id INNER JOIN regions on awards.recipient_region_id = regions.id  INNER JOIN certificates on awards.certificate_id = certificates.id WHERE awards.id  = ? ORDER BY awards.id ASC';
    let inserts = [req.params.id];
    db.pool.query(sql,inserts, (error, results, fields) => {
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
                    "award_date": element.date
                });
            });
            res.status(200).send(data);
        }
    });
}

//get individual award record
function createAwardRecord(req,res){
    const schema = Joi.object().keys ({
        certificate_id: Joi.number().positive().integer().required(),
        recipient_name: Joi.string().max(255).trim().required(),
        recipient_email: Joi.string().max(256).email().required(),
        recipient_department_id: Joi.number().positive().integer().required(),
        recipient_region_id: Joi.number().positive().integer().required(),
        presenter_id: Joi.number().positive().integer().required(),
        sent_on: Joi.date().required()
    });

    Joi.validate(req.body, schema, (err, value) => {
        if (err) {
            res.status(400).json({ 'message': err.details[0].message }).send();
            return;
        } else {
            var sql = 'INSERT INTO awards (certificate_id,  recipient_name, recipient_email, recipient_department_id, recipient_region_id, presenter_id, sent_on) VALUES (?,?,?,?,?,?,?)';
            var inserts = [req.body.certificate_id, req.body.recipient_name, req.body.recipient_email, req.body.recipient_department_id, req.body.recipient_region_id,  req.body.presenter_id, req.body.sent_on];
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
                        "presenter_id": req.body.presenter_id,            
                        "award_date": req.body.sent_on
                    });
                    res.status(200).send(data);
                }
            });
        }
    });
}


function deleteAwardRecord(req, res) {
    db.pool.query("DELETE FROM awards WHERE id = ?", [req.params.id], (error, results, fields) => {
        if(error) throw error;
     
        res.status(204).send();
    });
            
}

       

//routes
router.get('/awards', getAwards);
router.get('/awards/:id', getAward);
router.get('/awards_regions', getRegions);
router.get('/awards_departments', getDepartments);
router.get('/awards_presenters', getPresenters);
router.get('/awards_types', getAwardTypes);

router.post('/awards', createAwardRecord);
router.delete('/awards/:id', deleteAwardRecord);

module.exports = router;
