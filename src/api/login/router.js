const router = require('express').Router();
const Joi = require('@hapi/joi');
const db = require('../../db');
const crypto = require('crypto');

function login (req, res) {
    const schema = Joi.object().keys ({
        email: Joi.string().max(256).email({minDomainSegments: 2, tlds: {allow: ['com']}}).required(),
        password: Joi.string().required()
    })

    Joi.validate(req.body, schema, (err, value) => {
        if (err) {
            res.status(400).send(err.details[0].message);
            return;
        } else {
            db.pool.query("SELECT * FROM users WHERE email = ?", [req.body.email], (error, results, fields) => {
                if(error) throw error;
                
                if(results.length === 0) {
                    res.status(401).send('Incorrect email and/or password');
                } else {
                    db_pass = results[0].password;
                    salt = results[0].salt;
            
                    crypto.pbkdf2(req.body.password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                        if (err) throw err;
                        
                        if(derivedKey.toString('hex') !== db_pass) {
                            res.status(401).json({ 'message': 'Incorrect email and/or password' }).send();
                        } else {
                            // Temporarily set default cookie for 30 minutes
                            res.cookie('erp_session', '4a680909dd214c23a4ed0accd978c031', { expires: new Date(Date.now() + 1800000) })
                            res.json({ 'is_admin': results[0].is_admin });
                            res.status(200).send();
                        }
                    });
                }
            });
        }
    })
}

router.post('/login', login);

module.exports = router;