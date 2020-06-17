const path = require('path');
const express = require('express');
const rootDir = require('../util/path');

const router = express.Router();

// /admin/add-product => GET
router.get('/admin/add-product', (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views/add-product.html'));
});

// /admin/add-product => POST
router.post('/admin/add-product', (req, res) => {
    console.log(req.body);
    res.redirect('/');
});

module.exports = router;