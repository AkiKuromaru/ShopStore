const mysql = require('mysql2');
// สร้างตัวแปร connection จาก object mysql ให้ทำการเชื่อมต่อ
const connection = mysql.createConnection({
host: 'localhost', 
user:'root',
database:'itemstore',
password:''
});
connection.connect(err => {
    if (err) {
      console.error('Error connecting: ' + err.stack);
      return;
    }
    console.log('Connected as id ' + connection.threadId);
  });
module.exports = connection;
