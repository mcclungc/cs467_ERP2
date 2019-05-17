
const express = require('express');
const router = express.Router();
const db = require('../../db');


//get award types, i.e., certificates
function getCertificates(req,res){
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
} 
     

//get all departments
function getDepartments(req,res){
    const sql = 'SELECT * FROM departments ORDER BY departments.id ASC';
    db.pool.query(sql, (error, results, fields) => {
        if(results.length == 0 ){
            res.status(200).json({}).send();
        } else {
            let data = [];
            results.forEach(element => {
                data.push({
                    "id": element.id,
                    "depart_name": element.department_name
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
}

router.get('/org/certificates', getCertificates);
router.get('/org/regions', getRegions);
router.get('/org/departments', getDepartments);

module.exports = router;
