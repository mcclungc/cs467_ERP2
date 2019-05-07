const router = require('express').Router();
const Joi = require('@hapi/joi');
const db = require('../../db');
const crypto = require('crypto');

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

function createUser (req, res) {
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
}

router.post('/users', createUser);

module.exports = router;