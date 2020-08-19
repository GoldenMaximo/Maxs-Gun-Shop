const Product = require('../models/product');
const { validationResult } = require('express-validator/check');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
};

exports.postAddProduct = (req, res) => {
    const { title, price, description, imageUrl } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: {
                title,
                price,
                imageUrl,
                description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }

    new Product({ title, price, description, imageUrl, userId: req.user }).save().then(() => {
        console.log('Created Product');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
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
        })
    })
};

exports.postEditProduct = (req, res, next) => {
    const { productId, title, price, description, imageUrl } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title,
                price,
                imageUrl,
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
        product.imageUrl = imageUrl;
        return product.save().then(() => {
            console.log('UPDATED PRODUCT');
            res.redirect('/admin/products');
        });
    }).catch(err => {
        console.log(err);
    });
};

exports.postDeleteProduct = (req, res) => {
    const { productId } = req.params;
    Product.deleteOne({_id: productId, userId: req.user._id}).then(() => {
        console.log('DELETED PRODUCT');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    });
}

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        // .populate('userId')
        .then(products => {
            console.log(products);
            res.render('admin/products', {
                path: '/admin/products',
                pageTitle: 'Admin Products',
                prods: products,
            })
        }).catch(err => console.log(err));
};