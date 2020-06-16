const express = require('express');
const path = require('path');
const rootDir = require('../util/path');

const router = express.Router();

router.use((req, res) => {
    res.status(404).sendFile(path.join(rootDir, 'views/not-found.html'));
});

module.exports = router;