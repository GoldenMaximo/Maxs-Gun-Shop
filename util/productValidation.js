const { body } = require('express-validator/check');

module.exports = [
    body('title').isString().isLength({ min: 3, max: 50 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 8, max: 400 }).trim(),
    body('caliber').isLength({ min: 2, max: 20 }).trim(),
    body('magCapacity').isFloat(),
    body('barrelLength').isLength({ min: 2, max: 10 }).trim(),
    body('action').isLength({ min: 3, max: 20 }).trim(),
    body('weight').isLength({ min: 3, max: 10 }).trim(),
];