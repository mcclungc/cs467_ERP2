/* 
 * CS 467 Senior Project
 * Authors: Terence Berry, Corey Immke, Connie McClung, Alexander Yfraimov
 * File name: db.js
 * Description: Database setup.
 *
*/

var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit : 10,
  host            : '',
  user            : '',
  password        : '',
  database        : ''
});


module.exports.pool = pool;
