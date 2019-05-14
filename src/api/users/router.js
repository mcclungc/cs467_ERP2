const router = require('express').Router();
const Joi = require('@hapi/joi');
const db = require('../../db');
const crypto = require('crypto');

function sessionValidation(cookie) {	
	return new Promise((resolve, reject) => {
		mysql.pool.query("SELECT * FROM sessions WHERE id = ?", [cookie], (error, results, fields) => {
			if(error) throw error;

			if(results.length === 0) {
				reject('Session ID Invalid');
			} else {
				resolve();
			}
		})
	});
}

function querySalt(salt) {
    db.pool.query("SELECT count(id) as count FROM users WHERE salt = ?", [salt], (error, results, fields) => {
        if(error) throw error;

        return results[0].count;
    });
}

function createSalt() {
    let salt = '';
    do {
        salt = crypto.randomBytes(16).toString('hex');
        saltCount = querySalt(salt);
    } while(saltCount > 0);
    return salt;
}

function createUser(req, res) {
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
    } else {
        sessionValidation(req.cookies.erp_session).then(() => {
            const schema = Joi.object().keys ({
                email: Joi.string().max(256).email({minDomainSegments: 2, tlds: {allow: ['com']}}).required(),
                password: Joi.string().required(),
                name: Joi.string().max(255).trim().required(),
                signature: Joi.any().optional(),
                is_admin: Joi.number().min(0).max(1).integer().required(),
                region_id: Joi.number().positive().integer().optional(),
                department_id: Joi.number().positive().integer().optional()
            });
        
            Joi.validate(req.body, schema, (err, value) => {
                if (err) {
                    res.status(400).json({ 'message': err.details[0].message }).send();
                    return;
                } else {
                    salt = createSalt();
                    
                    crypto.pbkdf2(req.body.password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                        if (err) throw err;
                        today = new Date(Date.now());
        
                        db.pool.query("INSERT INTO users(email, password, salt, name, created_on, is_admin, signature, region_id, department_id) VALUES(?,?,?,?,?,?,?,?,?)",
                        [req.body.email, derivedKey.toString('hex'), salt, req.body.name, today, req.body.is_admin, req.body.signature, req.body.region_id, req.body.department_id],
                        (error, results, fields) => {
                            if(error) throw error;
        
                            data = {
                                "id": results.insertId,
                                "email": req.body.email,
                                "name": req.body.name,
                                "created_on": today
                            }
        
                            res.status(200).send(data);
                        });
                    });
                }
            });
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        })
    }  
}

function queryBuilder(is_admin, region_id, department_id) {
    let query = "SELECT * FROM users";
    let clauseArray = new Array(5);

    if(is_admin || region_id || department_id) {
        query += "WHERE ";
        if(is_admin) {
            clauseArray.push("is_admin = " + db.pool.escape(is_admin));
            clauseArray.push(", ");
        }
        if(region_id) {
            clauseArray.push("region_id = " + db.pool.escape(region_id));
            clauseArray.push(", ");
        }
        if(department_id) {
            clauseArray.push("department_id = " + db.pool.escape(department_id));
        }

        while(clauseArray.length > 0) {
            query += clauseArray.shift();
            if(clauseArray.length == 1) {
                clauseArray.pop();
            } else {
                query += clauseArray.shift();
            }
        }
    }

    query += " ORDER BY id;"

    return query;
}

function getUsers(req, res) {
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
    } else {
        sessionValidation(req.cookies.erp_session).then(() => {
            let is_admin = null;
            let region_id = null;
            let department_id = null;

            if(req.query.is_admin) {
                is_admin = req.query.is_admin;
            }
            if(req.query.region_id) {
                region_id = req.query.region_id;
            }
            if(req.query.department_id) {
                department_id = req.query.department_id;
            }

            const sql = queryBuilder(is_admin, region_id, department_id);

            db.pool.query(sql, (err, results, fields) => {
                if(results.length == 0) {
                    res.status(200).json({}).send();
                } else {
                    const data = {
                        "id": results.id,
                        "email": results.email,
                        "name": results.name,
                        "created_on": results.created_on,
                        "is_admin": results.is_admin,
                        "region_id": results.region_id,
                        "department_id": results.department_id
                    }
                    res.status(200).send(data);
                }
            });
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        })
    }
}

function getUser(res, req) {
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
    } else {
        sessionValidation(req.cookies.erp_session).then(() => {
            db.pool.query("SELECT * FROM users WHERE id = ?", [req.params.id], (err, results, fields) => {
                if(results.length == 0) {
                    res.status(200).json({}).send();
                } else {
                    const data = {
                        "id": results.id,
                        "email": results.email,
                        "name": results.name,
                        "created_on": results.created_on,
                        "is_admin": results.is_admin,
                        "region_id": results.region_id,
                        "department_id": results.department_id
                    }
                    res.status(200).send(data);
                }
            });
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        })
    }
}

router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUser);

module.exports = router;