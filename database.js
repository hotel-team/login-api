const mysql = require('mysql2');
const dbConnection = mysql.createPool({
    host     : 'localhost', 
    user     : 'root',        
    password : '',    
    database : 'login-test'      
}).promise();
module.exports = dbConnection;