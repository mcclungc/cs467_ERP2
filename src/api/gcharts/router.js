const express = require('express');
const router = express.Router();
const db = require('../../db');


//Gets user emails
function getUserEmails(req,res){
    const sql = 'SELECT email FROM users WHERE is_admin = 0 ORDER BY email ASC';
    db.pool.query(sql, (error, results, fields) => {
        if(results.length == 0 ){
            res.status(200).json({}).send();
        } else {
            let data = [];
            results.forEach(element => {
                data.push({
                    "email": element.email
                });
            });
            res.status(200).send(data);
        }
    });
}

//Gets results of region based end user query
function submitRegionQuery(req,res){
    const email = req.query.email;
    const breakdown = req.query.breakdown;
    const startDate = req.query.startdate;
    const endDate = req.query.enddate;
    var sql =   'SELECT presenter_id, users.email, ' +
    'SUM(recipient_region_id = 1) AS Northeastcount,' +
    'SUM(recipient_region_id = 2) AS Southcount,' +
    'SUM(recipient_region_id = 3) AS Midwestcount,' +
    'SUM(recipient_region_id = 4) AS Westcount' +
    ' FROM awards INNER JOIN users on presenter_id = ' +
    'users.id';

    var needToAddWhere = true;
    if (email != 'Select All'){
        sql += ' WHERE users.email = "' + email + '"';
        needToAddWhere = false;
    }

    if (startDate.length > 1 && endDate.length > 1){
        if (needToAddWhere){
                sql += ' WHERE sent_on >= "' + startDate + '" ' + 'AND sent_on <= "' + endDate + '"';
        }
else{
                sql += ' AND sent_on >= "' + startDate + '" ' + 'AND sent_on <= "' + endDate + '"';
        }
    }
    else if (startDate.length > 1){
        if (needToAddWhere){
                sql += ' WHERE sent_on >= "' + startDate + '" ';
        }
        else{
                sql += ' AND sent_on >= "' + startDate + '" ';
        }

    }
    else if (endDate.length > 1){
        if (needToAddWhere){
                sql += ' WHERE sent_on <= "' + endDate + '"';
        }
        else{
                sql += ' AND sent_on <= "' + endDate + '"';
        }

    }

    db.pool.query(sql, (error, results, fields) => {
        if(results.length == 0 ){
            res.status(200).json({}).send();
        } else {
            let data = [];
            results.forEach(element => {
                data.push({
                    "Northeast": element.Northeastcount,
                    "South": element.Southcount,
                    "Midwest": element.Midwestcount,
                    "West": element.Westcount,
		    "startDate": startDate,
		    "endDate": endDate
                });
            });
            res.status(200).send(data);
        }
    });
}

//Gets results of department based end user query
function submitDepartmentQuery(req,res){
    const email = req.query.email;
    const breakdown = req.query.breakdown;
    const startDate = req.query.startdate;
    const endDate = req.query.enddate;
    var sql =   'SELECT presenter_id, users.email,' +
    'SUM(recipient_department_id = 1) AS Financecount,' +
    'SUM(recipient_department_id = 2) AS Marketingcount,' +
    'SUM(recipient_department_id = 3) AS HRcount,' +
    'SUM(recipient_department_id = 4) AS ITcount,' +
    'SUM(recipient_department_id = 5) AS Legalcount,' +
    'SUM(recipient_department_id = 6) AS Sourcingcount,' +
    'SUM(recipient_department_id = 7) AS Engineeringcount,' +
    'SUM(recipient_department_id = 8) AS Salescount' +
    ' FROM awards INNER JOIN users on presenter_id = ' +
    'users.id';

    var needToAddWhere = true;
    if (email != 'Select All'){
        sql += ' WHERE users.email = "' + email + '"';
        needToAddWhere = false;
    }

    if (startDate.length > 1 && endDate.length > 1){
        if (needToAddWhere){
                sql += ' WHERE sent_on >= "' + startDate + '" ' + 'AND sent_on <= "' + endDate + '"';
        }
        else{
                sql += ' AND sent_on >= "' + startDate + '" ' + 'AND sent_on <= "' + endDate + '"';
        }
    }
    else if (startDate.length > 1){
        if (needToAddWhere){
                sql += ' WHERE sent_on >= "' + startDate + '" ';
        }
        else{
                sql += ' AND sent_on >= "' + startDate + '" ';
        }

    }
    else if (endDate.length > 1){
        if (needToAddWhere){
                sql += ' WHERE sent_on <= "' + endDate + '"';
        }
        else{
                sql += ' AND sent_on <= "' + endDate + '"';
        }

    }

    db.pool.query(sql, (error, results, fields) => {
        if(results.length == 0 ){
            res.status(200).json({}).send();
        } else {
            let data = [];
            results.forEach(element => {
                data.push({
                    "Finance": element.Financecount,
                    "Marketing": element.Marketingcount,
                    "HR": element.HRcount,
                    "IT": element.ITcount,
                    "Legal": element.Legalcount,
                    "Sourcing": element.Sourcingcount,
                    "Engineering": element.Engineeringcount,
                    "Sales": element.Salescount,
		    "startDate": startDate,
		    "endDate": endDate
                });
            });
            res.status(200).send(data);
        }
    });
}

router.get('/gcharts/getuseremails', getUserEmails);
router.get('/gcharts/submitregionquery', submitRegionQuery);
router.get('/gcharts/submitdepartmentquery', submitDepartmentQuery);

module.exports = router;

