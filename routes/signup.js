// routes/signup.js

const express = require('express');
const router = express.Router();
var mysql = require('../connect');

router.post('/', (req, res) => {
  var accountData = {
    Username: req.body.Username,
    Password: req.body.Password,
    Types: 'Customer'
  };

  var sqlAccount = 'INSERT INTO accounts SET ?';
  mysql.query(sqlAccount, accountData, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      var AccountID = result.insertId; // ได้ค่า AccountID ของบัญชีที่เพิ่มใหม่

      var customerData = {
        AccountID: AccountID,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Age: req.body.Age,
        Email: req.body.Email,
        CharacterName: req.body.CharacterName
      };

      var sqlCustomer = 'INSERT INTO customer SET ?';
      mysql.query(sqlCustomer, customerData, (err2, result2) => {
        if (err2) {
          res.send(err2);
        } else {
          var CustomerID = result2.insertId; // ได้ CustomerID

          // อัปเดต accounts ให้มี customer_id
          var updateSql = 'UPDATE accounts SET customer_id = ? WHERE AccountID = ?';
          mysql.query(updateSql, [CustomerID, AccountID], (err3, result3) => {
            if (err3) {
              res.send(err3);
            } else {
              res.redirect('/');
            }
          });
        }
      });
    }
  });
});



module.exports = router;
