
const express = require('express');
const router = express.Router();
const db = require('../../db');
const sessionValidation = require('../../session');


//get award types, i.e., certificates
function getCertificates(req,res){
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
        return;
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            const sql = 'SELECT * FROM certificates ORDER BY certificates.id ASC';
            db.pool.query(sql, (error, results, fields) => {
                if(results.length == 0 ){
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
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        })
    }
} 
     

//get all departments
function getDepartments(req,res){
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
        return;
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            const sql = 'SELECT * FROM departments ORDER BY departments.id ASC';
            db.pool.query(sql, (error, results, fields) => {
                if(results.length == 0 ){
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
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        })
    }
} 

//get all regions
function getRegions(req,res){
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
        return;
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            const sql = 'SELECT * FROM regions ORDER BY regions.id ASC';
            db.pool.query(sql, (error, results, fields) => {
                if(results.length == 0 ){
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
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        })
    }
}

router.get('/org/certificates', getCertificates);
router.get('/org/regions', getRegions);
router.get('/org/departments', getDepartments);


module.exports = router;
