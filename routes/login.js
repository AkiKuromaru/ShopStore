var mysql = require('../connect'); // นำเข้าการเชื่อมต่อฐานข้อมูล
var express = require('express');
var session = require('express-session');
var router = express.Router();

router.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Authentication route
router.post('/auth', function (request, response) {
  var Username = request.body.Username;
  var Password = request.body.Password;

  if (Username && Password) {
    // ตรวจสอบข้อผิดพลาด
    mysql.query('SELECT * FROM accounts WHERE Username = ? AND Password = ?', [Username, Password], (error, results) => {
      if (error) {
        console.error('Error during login:', error);
        return response.status(500).send('An error occurred while logging in.');
      }

      if (results.length > 0) {
        request.session.loggedin = true;
        request.session.Username = Username;

        if (results[0].Types === 'Admin') {
          const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // ใช้วันที่ปัจจุบัน
          const logData = {
            logUsername: Username,
            logPassword: Password,
            Date: currentDate
          };

          const query = 'INSERT INTO log SET ?';
          mysql.query(query, logData, (logError) => {
            if (logError) {
              console.error('Error inserting log:', logError);
              return response.status(500).send('Error logging admin action.');
            }
            console.log('Data inserted successfully!');
            response.redirect('/admins_auth/adminsForm'); // เปลี่ยนเส้นทางไปยังหน้า products สำหรับ admin
          });
        } else if (results[0].Types === 'Customer') {
          console.log(results);
          const CustomerID = results[0].customer_id ; // ใช้ตัวแปรนี้อย่างถูกต้อง
          console.log(CustomerID);
          response.redirect('/customers_auth/login/productsForm/' + CustomerID); // เปลี่ยนเส้นทางไปยังหน้า home สำหรับ customer
        }
      } else {
        response.send('Incorrect Username and/or Password!');
      }
    });
  } else {
    response.send('Please enter Username and Password!');
  }
});

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
