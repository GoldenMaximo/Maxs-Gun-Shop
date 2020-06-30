const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
    })
};

exports.postAddProduct = (req, res) => {
    const { title, imageUrl, price, description } = req.body;
    const product = new Product(null, title, imageUrl, description, price);
    product.save();
    res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product
        })
    })
};

exports.postEditProduct = (req, res, next) => {
    const { productId, title, imageUrl, price, description } = req.body;
    const updatedProduct = new Product(productId, title, imageUrl, description, price);
    updatedProduct.save();
    res.redirect('/admin/products');
};

exports.postDeleteProduct = (req, res) => {
    const { productId } = req.params;
    Product.delete(productId);
    res.redirect('/admin/products');
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('admin/products', {
            path: '/admin/products',
            pageTitle: 'Admin Products',
            prods: products
        })
    });
};