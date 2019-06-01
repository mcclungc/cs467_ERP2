const router = require('express').Router();
const Joi = require('@hapi/joi');
const db = require('../../db');
const crypto = require('crypto');
const mailer = require('nodemailer');
const email = require('../../email');
const sessionValidation = require('../../session');

let transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'cs467.erp2@gmail.com',
        clientId: email.client,
        clientSecret: email.secret,
        refreshToken: '1/Q4f4viCguSJLjfOfBuU2RuguW1uHNNdyC39kVcKWRDZpwxtuyRY5Bd83NkZV9nD9',
        accessToken: 'ya29.GlsQBzK-taNVovCNauIYlPrQllW7095SNg7Jf9cbSlSqXo-MqlIXI2v1Fotcf0ScV2aJgDzYWSZ1sZRe003obdzY2NwKy8sjZ0iKNqOFLx-DaHQO2fJB_GXIxzl-'
    }
});

function userCheck(email) {
    return new Promise((resolve, reject) => {
        db.pool.query("SELECT * FROM users WHERE email = ?", [email], (error, results, fields) => {
            if(error) throw error;

            if(results.length === 1) {
                resolve(results[0].id);
            } else {
                reject("User does not exist");
            }
        });
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

function generatePassword() {
    return crypto.randomBytes(8).toString('hex');
}

function resetPassword(req, res) {
    const schema = Joi.object().keys ({
        email: Joi.string().max(256).email({minDomainSegments: 2, tlds: {allow: ['com', 'edu']}}).required()
    });

    Joi.validate(req.body, schema, (err, value) => {
        if (err) {
            res.status(400).json({ 'message': err.details[0].message }).send();
            return;
        } else {
            userCheck(req.body.email).then(user_id => {
                const pass = generatePassword();
                const salt = createSalt();

                crypto.pbkdf2(pass, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                    if(err) throw err;

                    const data = {
                        "password": derivedKey.toString('hex'),
                        "salt": salt
                    }

                    db.pool.query("UPDATE users SET ? WHERE id = ?", [data, user_id], (error, results, fields) => {
                        if(error) throw error;
    
                        transporter.sendMail({
                            from: 'cs467.erp2@gmail.com',
                            to: req.body.email,
                            subject: 'ERP Password Reset',
                            text: `You're password has been reset to ${pass}. Please login and change it to something else as soon as you can.`,
                            html: `<p>Hello,</p><p>You're password has been reset to</p><p>${pass}</p><p>Please login and change it to something else as soon as you can.`
                        }, (err, info) => {
                            if(err) {
                                res.status(400).json({'message': 'Email failed'}).send();
                                return;
                            }

                            res.status(200).json({'message': 'Email sent'}).send();
                        });
                    });
                });  
            }).catch(error => {
                res.status(400).json({ 'message': error }).send();
            })
        }
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

function changePassword(req, res) {
    if(!req.cookies.erp_session) {
        res.status(401).json({ 'message': 'Invalid User' }).send();
    } else {
        sessionValidation(req.cookies.erp_session).then(userData => {
            const schema = Joi.object().keys ({
                newPassword: Joi.string().required(),
                confirmPassword: Joi.string().required()
            });

            Joi.validate(req.body, schema, (err, value) => {
                if (err) {
                    res.status(400).json({ 'message': err.details[0].message }).send();
                    return;
                } else {
                    if(req.body.newPassword !== req.body.confirmPassword) {
                        res.status(400).json({ 'message': 'Passwords must match' }).send();
                        return;
                    }
                    
                    const salt = createSalt();
            
                    crypto.pbkdf2(req.body.newPassword, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                        if(err) throw err;

                        const data = {
                            "password": derivedKey.toString('hex'),
                            "salt": salt
                        }

                        db.pool.query("UPDATE users SET ? WHERE id = ?", [data, userData.user_id], (error, results, fields) => {
                            if(error) throw error;
    
                            res.status(200).json({ 'message': 'Password Updated' }).send();
                            return;
                        });
                    });
                }
            });
        }).catch(error => {
            res.status(401).json({ 'message': error }).send();
            return;
        })
    }
}

router.post('/password', resetPassword);
router.patch('/password', changePassword);

module.exports = router;