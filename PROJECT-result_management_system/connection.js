// Creating connection with databse
const mysql = require('mysql2');
const con =  mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "root",
    database:"resultmanagementsystemdb"
});
con.connect();
con.connect((err)=>{
    if(err){
        console.log("error in connection");
    } else {
        console.log("connected successfully");
    }
});

module.exports = con;