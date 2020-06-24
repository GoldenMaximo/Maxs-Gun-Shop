const express = require('express');

const router = express.Router();
const errorController = require('../controllers/errors');

router.use(errorController.get404);

module.exports = router;