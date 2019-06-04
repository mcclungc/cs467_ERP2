const router = require('express').Router();
const db = require('../../db');

// Route handler to log the user out. Clears their session from the table and sets the cookie
// expiration to in the past so the browser wipes them out.
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