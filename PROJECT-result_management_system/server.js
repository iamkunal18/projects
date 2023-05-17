const express = require('express');
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const path = require('path');
const session = require('express-session');
var alert = require('alert');
const router = express.Router();

const database = require("./connection");

const app = express();
var result ="";
dotenv.config({path:'config.env'});
const PORT = process.env.PORT||8080

app.use(session({
    secret : 'webslession',
    resave : true,
    saveUninitialized : true
}));

app.use(express.json());

// log request
app.use(morgan('tiny'));

// parse request to body-parser
app.use(bodyparser.urlencoded({extended:true}));

// set view engine
app.set("view engine", "ejs");

// load assets
app.use('/css', express.static(path.resolve(__dirname, "assets/css")));
app.use('/img', express.static(path.resolve(__dirname, "assets/img")));
app.use('/js', express.static(path.resolve(__dirname, "assets/js")));

//Home page
router.get("/",  (req, res)=>{
    res.render('index');
});  

//Teacher login page
router.get('/teacher-login',  (req, res, next)=>{
    res.render('teacher_login', { title: 'Express', session: req.session});
}); 

//form submitting for teacher login
router.post('/teacher_login', (req, res, next)=>{
    const teacher_userName = req.body.userName;
    const teacher_password = req.body.password;

    if (teacher_userName && teacher_password) {
        const query = `
            SELECT * FROM teacher 
            WHERE username = "${teacher_userName}"
        `;
        database.query(query, (error, data)=>{
            if (data.length > 0) {
                for (var count = 0; count < data.length; count++) {
                    if (data[count].password == teacher_password) {
                        req.session.id = data[count].id;
                        alert("Login Successfully");
                        res.redirect('/teacher-home');
                    } else {
                        alert("Incorrect Password");
                        res.redirect('/teacher-login');
                    }
                }
            } else {
                alert("Invalid Credentials! Please fill correct details or please signup.");
                res.redirect('/teacher-login');
            }
        });
    }
});


//Teacher signup page
router.get("/teacher-signup",  (req, res)=>{
    res.render('teacher_signup');
}); 

//form submitting for teacher signup
router.post('/teacher-signup', (req, res, next)=>{
    var teacher_name = req.body.name;
    var teacher_email = req.body.email;
    var teacher_uname = req.body.userName;
    var teacher_password = req.body.password;


    if (teacher_name && teacher_email && teacher_uname && teacher_password){
            var sql = "INSERT INTO teacher (name, email, username, password) VALUES (?, ?, ?, ?);"
            database.query(sql, [teacher_name, teacher_email, teacher_uname, teacher_password], (err, result, fields)=>{
                if(err) {
                    throw err;
                } else {
                    alert("Successfully Signup! You can login now");
                    res.redirect("/teacher-login");
                }
            });
    }
});


//student view result form page
router.get("/student-view-result",  (req, res)=>{
    result = "";
    res.render('student_view_result');
});  

//form submitting for view result
router.post('/student-view-result', (req, res, next)=>{
    var student_rollno = req.body.rollNo;
    var student_dob = req.body.dob;
    student_dob = formatDate(student_dob);
    
    const sql = `SELECT * FROM results 
            WHERE rollno = "${student_rollno}" 
            AND
            dob = "${student_dob}"
        `;
    let query = database.query(sql, (err, row)=>{
        if(err) throw err;
        else {
            if(row.length > 0){
                row[0].dob = formatDate(row[0].dob);
                result = row;
                res.redirect("/result-page");
            }else {
                alert("Invalid credentials! Please fill correct details.")
            }
            
        }
    });
});


//teacher home page
router.get("/teacher-home",  (req, res)=>{
    let sql = "SELECT * FROM results";
    let query = database.query(sql, (err, rows)=>{
        if(err) throw err;
        else {
            for (var count = 0; count < rows.length; count++){
                rows[count].dob = formatDate(rows[count].dob);
            }
            res.render('teacher_home',{ results: rows})
        }
    });
});  

//add new record home page
router.get("/add-record",  (req, res)=>{
    res.render('add_record');
}); 

//form submitting for adding new record
router.post('/add-record', (req, res, next)=>{
    var student_rollno = req.body.rollno;
    var student_name = req.body.name;
    var student_dob = req.body.dob;
    var student_maxmarks = req.body.maxmarks;
    var student_obtainedmarks = req.body.obtainedmarks;

    student_dob =  formatDate(student_dob);

    if (parseInt(req.body.maxmarks) < parseInt(req.body.obtainedmarks)) {
        alert("Obtained marks are invalid");
        res.redirect("/add-record");
    } else if (parseInt(req.body.maxmarks) >= parseInt(student_obtainedmarks)){
        if (student_rollno && student_name && student_dob && student_maxmarks && student_obtainedmarks){
            var sql = "INSERT INTO results (rollno, name, dob, score, maxmarks) VALUES (?,?,?,?,?);"
            database.query(sql, [student_rollno, student_name, student_dob, student_obtainedmarks, student_maxmarks], (err, result, fields)=>{
                if(err) {
                    throw err;
                } else {
                    alert("1 Record added");
                    res.redirect("/teacher-home");
                }
            });
        }
    }
});

//result show page
router.get("/result-page",  (req, res)=>{
    console.log(result);
    res.render('result_page', {result});
}); 


//edit record page
router.get('/edit/:id', (req, res) => {
    const student_id = req.params.id;
    var sql = `SELECT * FROM results WHERE id = "${student_id}"`;

    var query = database.query(sql, (err, results) =>{
        results[0].dob = formatDate(results[0].dob);
        if(err) throw err;
        res.render('record_edit', {
            result : results[0]
        })
    });
});

//form submitting for editing a record
router.post('/edit/:id', (req, res, next)=>{
    var student_id = req.body.id;
    var student_rollno = req.body.rollno;
    var student_name = req.body.name;
    var student_dob = req.body.dob;
    var student_maxmarks = req.body.maxmarks;
    var student_obtainedmarks = req.body.obtainedmarks;

    student_dob =  formatDate(student_dob);

    if (student_rollno && student_name && student_dob && student_maxmarks && student_obtainedmarks){
        var sql = "UPDATE results SET rollno = ?, name = ?, dob = ?, score = ?, maxmarks = ? WHERE id = ?;"
        database.query(sql, [student_rollno, student_name, student_dob, student_obtainedmarks, student_maxmarks, student_id], (err, result, fields)=>{
            if(err) {
                throw err;
            } else {
                alert("Record updated Succesfully");
                res.redirect("/teacher-home");
            }
        });
    }
});

//deleting record
router.get('/delete/:id', (req, res) => {
    const student_id = req.params.id;
    var sql = `DELETE FROM results WHERE id = "${student_id}"`;

    var query = database.query(sql, (err, results) =>{
        if(err) throw err;
        res.redirect("/teacher-home");
    });
});



app.use('/', router);

// function for formating date in YYYY-MM-DD format
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

//starting server
app.listen(4500, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});