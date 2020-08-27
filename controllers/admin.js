const Product = require('../models/product');
const { validationResult } = require('express-validator/check');
const mongoose = require('mongoose');
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postAddProduct = (req, res, next) => {
    const { title, price, description } = req.body;
    const errors = validationResult(req);
    const image = req.file;

    if (!errors.isEmpty() || !image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title,
                price,
                description
            },
            errorMessage: (!errors.isEmpty() ? errors.array()[0].msg : 'Please attach an image in one of the valid formats (.png, .jpg or .jpeg)'),
            validationErrors: (!errors.isEmpty() ? errors.array() : [])
        })
    }

    const imageUrl = image.path;

    new Product({ title, price, description, imageUrl, userId: req.user }).save().then(() => {
        console.log('Created Product');
        res.redirect('/admin/products');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId).then(product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product,
            hasError: false,
            errorMessage: null,
            validationErrors: []
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
};

exports.postEditProduct = (req, res, next) => {
    const { productId, title, price, description } = req.body;
    const errors = validationResult(req);

    const image = req.file;

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title,
                price,
                description,
                _id: productId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }

    Product.findById(productId).then(product => {
        if (req.user._id.toString() !== product.userId.toString()) {
            return res.redirect('/');
        }
        product.title = title;
        product.price = price;
        product.description = description;
        if (image) {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        return product.save().then(() => {
            console.log('UPDATED PRODUCT');
            res.redirect('/admin/products');
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.deleteProduct = (req, res) => {
    const { productId } = req.params;
    Product.findById(productId).then(prod => {
        if (!prod) return next(new Error('Product not found'));
        fileHelper.deleteFile(prod.imageUrl);
        return Product.deleteOne({ _id: productId, userId: req.user._id })
    }).then(() => {
        console.log('DELETED PRODUCT');
        res.status(200).json({
            message: 'Success'
        });
    }).catch(err => {
        res.status(500).json({
            message: 'Deleting product failed.'
        });
    });
}

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        // .populate('userId')
        .then(products => {
            res.render('admin/products', {
                path: '/admin/products',
                pageTitle: 'Admin Products',
                prods: products,
            })
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};