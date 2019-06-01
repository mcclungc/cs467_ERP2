const db = require('./db');

module.exports = function sessionValidation(cookie) {	
	return new Promise((resolve, reject) => {
		db.pool.query("SELECT * FROM sessions WHERE id = ?", [cookie], (error, results, fields) => {
			if(error) throw(error);

			if(results.length === 0) {
				reject('Session ID Invalid');
			} else {
                const user_id = results[0].user_id
                db.pool.query("SELECT * FROM users WHERE id = ?", [user_id], (error, results, fields) => {
                    if(error) throw(error);
                    
                    if(results.length === 0) {
                        reject('User does not exist');
                    }
                    resolve({
                        "user_id": user_id,
                        "is_admin": results[0].is_admin
                    });
                });
			}
		});
	});
};