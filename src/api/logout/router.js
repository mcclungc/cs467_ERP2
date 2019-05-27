const router = require('express').Router();
const db = require('../../db');

function logout(req, res) {
        
    db.pool.query("DELETE FROM sessions WHERE id = ?", [req.cookies.erp_session], (error, results, fields) => {
        if(error) throw error;
        
        res.cookie('erp_session', '', { expires:  new Date(0) });
        res.cookie('erp_is_admin', '', { expires:  new Date(0) });
        res.redirect('/');
    })
}

router.get('/logout', logout);

module.exports = router;