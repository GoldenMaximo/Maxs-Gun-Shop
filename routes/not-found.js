const express = require('express');
const path = require('path');

const router = express.Router();

router.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../views/not-found.html'));
});

module.exports = router;