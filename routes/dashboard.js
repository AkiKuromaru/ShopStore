var express = require('express');
var router = express.Router();
var mysql = require('../connect');

router.get('/dashboard', (req, res) => {
    // คิวรียอดรวมของจำนวนสินค้าที่ขายในวันนี้
    const salesSql = `SELECT SUM(quantity) AS TotalSales
                        FROM orders
                        WHERE Date >= CURDATE() AND Date < CURDATE() + INTERVAL 1 DAY;`;

    // คิวรีจำนวนคำสั่งซื้อทั้งหมดในวันนี้
    const countSql = 'SELECT COUNT(Order_ID) AS TotalOrders FROM orders WHERE DATE(Date) = CURDATE();';

    // คิวรียอดรวมราคา (totalPrice) ของคำสั่งซื้อในวันนี้
    const totalPriceSql = `SELECT SUM(totalPrice) AS totalPrice
                            FROM orders
                            WHERE Date >= CURDATE() AND Date < CURDATE() + INTERVAL 1 DAY;`;

    // ทำการคิวรีข้อมูลทั้งหมด
    mysql.query(salesSql, (err, salesResult) => {
        if (err) {
            return res.send(err);
        }

        mysql.query(countSql, (err, countResult) => {
            if (err) {
                return res.send(err);
            }

            mysql.query(totalPriceSql, (err, totalPriceResult) => {
                if (err) {
                    return res.send(err);
                }

                // ตรวจสอบผลลัพธ์ของ totalSales, totalOrders, และ totalPrice
                const totalSales = salesResult[0].TotalSales || 0; // ค่าปกติเป็น 0 ถ้าไม่มีการขาย
                const totalOrders = countResult[0].TotalOrders || 0; // ค่าปกติเป็น 0 ถ้าไม่มีการขาย
                const totalPrice = totalPriceResult[0].totalPrice || 0; // ค่าปกติเป็น 0 ถ้าไม่มีการขาย

                console.log(`Total Sales: `, totalSales);
                console.log(`Total Orders: `, totalOrders);
                console.log(`Total Price: `, totalPrice);

                // ส่งข้อมูลทั้งหมดไปยังวิว
                res.render('dashboard', { totalSales, totalOrders, totalPrice }); // ส่งค่า totalSales, totalOrders, totalPrice ไปยัง EJS
            });
        });
    });
});

module.exports = router;
