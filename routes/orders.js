var express = require('express');
var router = express.Router();
var mysql = require('../connect');

router.get('/orders', (req, res) => {
  const quantity = req.query.quantity;
  const customerID = req.query.customerID;  // ใช้ customerID ที่รับมาจาก query หรือจากพารามิเตอร์อื่นๆ
  const productIDs = req.query.productIDs.split(',').map(Number);
  const sql = 'SELECT Product_ID, ProductName, ProductPrice FROM stock WHERE Product_ID IN (?) AND Amount > 0';

  mysql.query(sql, [productIDs], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }

    let subtotal = 0;
    let subtotals = [];
    let quantitys = [];
    let date = new Date().toISOString().slice(0, 10).replace('T', ' '); // รับวันที่ในรูปแบบ YYYY-MM-DD
    
    for (let i = 0; i < result.length; i++) {
      const itemSubtotal = result[i].ProductPrice * quantity;
      subtotal += itemSubtotal;
      subtotals.push(itemSubtotal);
      quantitys.push(quantity);
    }

    // สร้างข้อมูลคำสั่งซื้อที่จะบันทึกลงฐานข้อมูล
    const orderData = result.map((item, index) => ({
      CustomerID: customerID, // ใช้ customerID ที่ได้จากการรับข้อมูล
      Product_ID: item.Product_ID,
      ProductName: item.ProductName,
      quantity: quantitys[index],
      totalPrice: subtotals[index],
      Date: date,
    }));

    // บันทึกข้อมูลคำสั่งซื้อ (กรณีนี้ใช้คำสั่ง SQL INSERT)
    const insertSql = 'INSERT INTO orders (CustomerID, Product_ID, ProductName, quantity, totalPrice, Date, status, Payment) VALUES ?';
    const values = orderData.map(order => [order.CustomerID, order.Product_ID, order.ProductName, order.quantity, order.totalPrice, order.Date, 'Pending', 'Credit Card']);

    mysql.query(insertSql, [values], (err) => {
      if (err) {
        return res.status(500).send(err);
      }

      res.render('ordersListForm', { products: result, customerID, quantitys, subtotals, total: subtotal });
    });
  });
});

module.exports = router;
