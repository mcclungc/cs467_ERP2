const router = require('express').Router();
const Joi = require('@hapi/joi');
const db = require('../../db');
const crypto = require('crypto');

function querySession(session_id) {
    db.pool.query("SELECT count(id) as count FROM sessions WHERE id = ?", [session_id], (error, results, fields) => {
        if(error) throw error;

        return results[0].count;
    });
}

function createSession(user_id, expiration) {
    return new Promise((resolve, reject) => {
        let sessionIDCount = 0;
        let sessionID = '';
        do {
            sessionID = crypto.randomBytes(8).toString('hex');
            sessionIDCount = querySession(sessionID);
        } while(sessionIDCount > 0);
        
        data = {id: sessionID, user_id: user_id, expires: expiration};

        db.pool.query("DELETE FROM sessions WHERE user_id = ?", [user_id], (error, results, fields) => {
            if(error) {
                reject(error);
            }

            db.pool.query("INSERT INTO sessions SET ?", [data],
            (error, results, fields) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(sessionID);
                }
            });
        })
    });
}

function login (req, res) {
    if(!req.is('application/json')) {
        res.status(400).json({ 'message': 'Request must be application/json' }).send();
    }
    
    const schema = Joi.object().keys ({
        email: Joi.string().max(256).email({minDomainSegments: 2, tlds: {allow: ['com']}}).required(),
        password: Joi.string().required()
    })

    Joi.validate(req.body, schema, (err, value) => {
        if (err) {
            res.status(400).json({ 'message': err.details[0].message }).send();
            return;
        } else {
            db.pool.query("SELECT * FROM users WHERE email = ?", [req.body.email], (error, results, fields) => {
                if(error) throw error;
                
                if(results.length === 0) {
                    res.status(401).json({ 'message': 'Incorrect email and/or password' }).send();
                } else {
                    db_pass = results[0].password;
                    salt = results[0].salt;
            
                    crypto.pbkdf2(req.body.password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                        if (err) throw err;
                        
                        if(derivedKey.toString('hex') !== db_pass) {
                            res.status(401).json({ 'message': 'Incorrect email and/or password' }).send();
                        } else {
                            expiration = new Date(Date.now() + 1800000);
                            createSession(results[0].id, expiration).then(sessionID => {
                                res.cookie('erp_session', sessionID, { expires:  expiration });
                                res.cookie('erp_is_admin', results[0].is_admin, { expires:  expiration });
                                res.json({ 'is_admin': results[0].is_admin });
                                res.status(200).send();
                            }).catch(error => {
                                throw error;
                            })
                        }
                    });
                }
            });
        }
    })
}

router.post('/login', login);

module.exports = router;