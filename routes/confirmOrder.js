var express = require('express');
var router = express.Router();
var mysql = require('../connect');


// เพิ่มข้อมูลในตาราง 
router.post('/confirmOrder/:customerID', (req, res) => {
    const data = req.body;
    const customerID = req.params.customerID;

    // ตรวจสอบข้อมูลที่ได้รับ
    const quantities = Array.isArray(data['quantitys[]']) ? data['quantitys[]'] : [data['quantitys[]']];
    const Product_ID = Array.isArray(data['Product_ID[]']) ? data['Product_ID[]'] : [data['Product_ID[]']];
    const ProductPrice = Array.isArray(data['ProductPrice[]']) ? data['ProductPrice[]'] : [data['ProductPrice[]']];
    const ProductName = Array.isArray(data['ProductName[]']) ? data['ProductName[]'] : [data['ProductName[]']];

    if (!Array.isArray(Product_ID) || !Array.isArray(quantities) || !Array.isArray(ProductPrice) || !Array.isArray(ProductName)) {
        return res.status(400).send('Invalid input data.');
    }

    let totalAll = 0;

    // เริ่ม Transaction
    mysql.beginTransaction(err => {
        if (err) {
            console.error('Transaction start failed:', err);
            return res.status(500).send('Transaction failed to start.');
        }
    
        const insertOrderQuery = `
            INSERT INTO orders (Product_ID, CustomerID, ProductName, quantity, totalPrice, Date, status, Payment)
            VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`;
    
        const updateStockQuery = `
            UPDATE stock
            SET Amount = Amount - ?
            WHERE Product_ID = ?`;
    
        let completedQueries = 0;
    
        for (let i = 0; i < Product_ID.length; i++) {
            const productId = Product_ID[i];
            const quantity = quantities[i];
            const subtotalPrice = quantity * ProductPrice[i];
            totalAll += subtotalPrice;
    
            const productName = ProductName[i];
            const orderStatus = 'Pending';
            const paymentMethod = 'Credit Card';
    
            const values = [productId, customerID, productName, quantity, subtotalPrice, orderStatus, paymentMethod];
    
            mysql.query(insertOrderQuery, values, (err, result) => {
                if (err) {
                    return mysql.rollback(() => {
                        console.error('Error inserting order:', err);
                        res.status(500).send('Error inserting order.');
                    });
                }
    
                mysql.query(updateStockQuery, [quantity, productId], (updateErr, updateResult) => {
                    if (updateErr) {
                        return mysql.rollback(() => {
                            console.error('Error updating stock:', updateErr);
                            res.status(500).send('Error updating stock.');
                        });
                    }
    
                    completedQueries++;
                    if (completedQueries === Product_ID.length) {
                        mysql.commit(err => {
                            if (err) {
                                return mysql.rollback(() => {
                                    console.error('Transaction commit failed:', err);
                                    res.status(500).send('Transaction failed.');
                                });
                            }
                            res.render('paymentForm', { totalPrice: totalAll, CustomerID: customerID });
                            console.log('Total All:', totalAll);
                        });
                    }
                });
            });
        }
    });
});

module.exports = router;
