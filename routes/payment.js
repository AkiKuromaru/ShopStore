var express = require('express');
var router = express.Router();
var mysql = require('../connect');
const multer = require('multer'); // เพิ่ม Multer

// ตั้งค่าการเก็บไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/web/web/app/Recept'); // ชื่อโฟลเดอร์ที่คุณต้องการเก็บไฟล์
  },
  filename: function (req, file, cb) {
    const date = new Date();
    const timestamp = date.getTime(); // หาค่า timestamp ปัจจุบัน
    const fileExtension = file.originalname.split('.').pop(); // หานามสกุลของไฟล์

    // สร้างชื่อไฟล์ใหม่โดยใช้ timestamp และนามสกุลไฟล์
    const newFileName = `${timestamp}.${fileExtension}`;
    cb(null, newFileName);
  },
});

const upload = multer({ storage: storage });

router.post('/payment/:CustomerID/:total', upload.single('Recept'), (req, res) => {
  // ตรวจสอบว่าไฟล์ได้รับการอัปโหลดหรือไม่
  if (!req.file) {
      return res.status(400).send('No file uploaded');
  }

  const customerID = req.params.CustomerID;
  const total = req.params.total;
  const { PayName, PayAddress, PayTel } = req.body;

  if (!PayName || !PayAddress || !PayTel) {
      return res.status(400).send('Missing required fields');
  }

  const paymentData = {
      PayName: PayName, 
      PayAddress: PayAddress,  
      PayTel: PayTel,  
      SlipPayment: `/Recept/${req.file.filename}`,  
      CustomerID: customerID,  
      totalPrice: total  
  };

  var sql = 'INSERT INTO payment SET ?';
  mysql.query(sql, paymentData, (err, result) => {
      if (err) {
          console.error('Error inserting data into payment table:', err);
          return res.status(500).send('Database error');
      } else {
          var sql = 'SELECT * FROM payment ORDER BY PayID DESC LIMIT 1';
          mysql.query(sql, (err, result) => {
              if (err) {
                  console.error('Error retrieving payment record:', err);
                  return res.status(500).send('Database error');
              } else {
                  res.render('confirmPaymentForm', { payment: result, customerID, total });
              }
          });
      }
  });
});


module.exports = router;
