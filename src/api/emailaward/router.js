const express = require('express');
const router = express.Router();
const db = require('../../db');
const Joi = require('@hapi/joi');
const fs = require('fs');
const latexmodule = require('../../latexmodule');
var dateFormat = require('dateformat');

//RIGHT NOW THIS FUNCTION JUST LOOKS FOR THE AWARD FILE IF IT IS ALREADY IN THE DIRECTORY. IF NOT IT
//WILL THROW AN ERROR
function emailAwardRecord(req, res) {
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
            });
            res.status(200).send(data);
        }
    });
}
router.get('/emailaward/:id',emailAwardRecord);
module.exports = router;