const router = require('express').Router();
const Joi = require('@hapi/joi');
const db = require('../../db');
const sessionValidation = require('../../session');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer();

// Check if the salt value already exists in the users table
function querySalt(salt) {
    db.pool.query("SELECT count(id) as count FROM users WHERE salt = ?", [salt], (error, results, fields) => {
        if(error) throw error;

        return results[0].count;
    });
}

// Create a new unique password salt
function createSalt() {
    let salt = '';
    do {
        salt = crypto.randomBytes(16).toString('hex');
        saltCount = querySalt(salt);
    } while(saltCount > 0);
    return salt;
}

// Check if the email already exists for a user
function userCheck(email) {
    return new Promise((resolve, reject) => {
        db.pool.query("SELECT * FROM users WHERE email = ?", [email], (error, results, fields) => {
            if(error) throw error;

            if(results.length > 0) {
                reject('Account already exists');
            } else {
                resolve();
            }
        });
    });
}

// Route handler to create a new user
function createUser(req, res) {
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
        return;
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            if(userData.is_admin !== 1) {
                res.status(401).json({ 'message': 'Invalid User' }).send();
                return;
            } else {
                const schema = Joi.object().keys ({
                    email: Joi.string().max(256).email({minDomainSegments: 2, tlds: {allow: ['com', 'edu']}}).required(),
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
                        userCheck(req.body.email).then(() => {
                            
                            salt = createSalt();
                        
                            crypto.pbkdf2(req.body.password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                                if (err) throw err;
                                today = new Date(Date.now());
                                today.setMilliseconds(0);
                                let sig = null;
                
                                if(req.file) {
                                    if(req.file.size > 15000000) {
                                        res.status(400).json({ 'message': "Signature file too large" });
                                        return;
                                    }

                                    if(req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
                                        res.status(400).json({ 'message': "Incorrect filetype" });
                                        return;
                                    }
                                    sig = req.file.buffer;
                                } 

                                db.pool.query("INSERT INTO users(email, password, salt, name, created_on, is_admin, signature, region_id, department_id) VALUES(?,?,?,?,?,?,?,?,?)",
                                [req.body.email, derivedKey.toString('hex'), salt, req.body.name, today, req.body.is_admin, sig, req.body.region_id, req.body.department_id],
                                (error, results, fields) => {
                                    if(error) throw error;
                
                                    data = {
                                        "id": results.insertId,
                                        "email": req.body.email,
                                        "name": req.body.name,
                                        "created_on": today
                                    }
                
                                    res.status(200).send(data);
                                    return;
                                });
                            });
                        }).catch(error => {
                            res.status(400).json({ 'message': error }).send();
                            return;
                        })
                    }
                });
            }
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        })
    }  
}

// Build's out query for pulling users based on parameters a user may choose
function queryBuilder(is_admin, region_id, department_id) {
    let query = "SELECT * FROM users";
    let clauseArray = [];

    if(is_admin || region_id || department_id) {
        query += " WHERE ";
        if(is_admin) {
            clauseArray.push("is_admin = " + db.pool.escape(is_admin));
            clauseArray.push("AND ");
        }
        if(region_id) {
            clauseArray.push("region_id = " + db.pool.escape(region_id));
            clauseArray.push("AND ");
        }
        if(department_id) {
            clauseArray.push("department_id = " + db.pool.escape(department_id));
        }

        while(clauseArray.length > 0) {
            query += clauseArray.shift();
            if(clauseArray.length == 1) {
                clauseArray.pop();
            } else if(clauseArray.length > 1) {
                query += clauseArray.shift();
            }
        }
    }

    query += " ORDER BY id;"

    return query;
}

// Route handler to get user data with ability to query certain parameters
function getUsers(req, res) {
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
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
                    let data = [];
                    results.forEach(element => {
                        data.push({
                            "id": element.id,
                            "email": element.email,
                            "name": element.name,
                            "created_on": element.created_on,
                            "is_admin": element.is_admin,
                            "region_id": element.region_id,
                            "department_id": element.department_id
                        })
                    });
                    res.status(200).json(data).send();
                }
            });
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        })
    }
}

// Route handler to pull single user
function getUser(req, res) {
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
        return;
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            db.pool.query("SELECT * FROM users WHERE id = ?", [req.params.id], (err, results, fields) => {
                if(results.length == 0) {
                    res.status(200).json({}).send();
                    return;
                } else {
                    const data = {
                        "id": results[0].id,
                        "email": results[0].email,
                        "name": results[0].name,
                        "signature": results[0].signature,
                        "created_on": results[0].created_on,
                        "is_admin": results[0].is_admin,
                        "region_id": results[0].region_id,
                        "department_id": results[0].department_id
                    }
                    res.status(200).json(data).send();
                    return;
                }
            });
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
            return;
        })
    }
}

// Route handler to update user
function updateUser(req, res) {
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            const schema = Joi.object().keys ({
                name: Joi.string().max(255).trim().optional(),
                region_id: Joi.number().positive().integer().optional(),
                department_id: Joi.number().positive().integer().optional()
            });

            Joi.validate(req.body, schema, (err, value) => {
                if (err) {
                    res.status(400).json({ 'message': err.details[0].message }).send();
                    return;
                } else {
                    data = {}
                    
                    if(req.body.name) data['name'] = req.body.name;
                    if(req.body.region_id) data['region_id'] = req.body.region_id;
                    if(req.body.department_id) data['department_id'] = req.body.department_id;

                    db.pool.query("UPDATE users SET ? WHERE id = ?", [data, req.params.id], (error, results, fields) => {
                        if(error) throw error;

                        db.pool.query("SELECT * FROM users WHERE id = ?", [req.params.id], (err, results, fields) => {
                            if(err) throw err;

                            const data = {
                                "id": results[0].id,
                                "email": results[0].email,
                                "name": results[0].name,
                                "created_on": results[0].created_on,
                                "is_admin": results[0].is_admin,
                                "region_id": results[0].region_id,
                                "department_id": results[0].department_id
                            }
                            res.status(200).json(data).send();
                        });
                    })
                }
            });
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        })
    }
}

// Router handler to delete specific user
function deleteUser(req, res) {
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            if(userData.is_admin !== 1) {
                res.status(401).json({ 'message': 'Invalid User' }).send();
            } else {
                db.pool.query("DELETE FROM users WHERE id = ?", [req.params.id], (error, results, fields) => {
                    if(error) throw error;

                    res.status(204).send();
                })
            
            }
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
        })
    } 
}

router.post('/users', upload.single('signature'), createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;