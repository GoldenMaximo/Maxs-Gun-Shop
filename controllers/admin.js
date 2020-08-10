const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        isAuthenticated: req.session.isLoggedIn
    })
};

exports.postAddProduct = (req, res) => {
    const { title, price, description, imageUrl } = req.body;

    new Product({ title, price, description, imageUrl, userId: req.session.user }).save().then(() => {
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
            isAuthenticated: req.session.isLoggedIn
        })
    })
};

exports.postEditProduct = (req, res, next) => {
    const { productId, title, price, description, imageUrl } = req.body;

    Product.findById(productId).then(product => {
        product.title = title;
        product.price = price;
        product.description = description;
        product.imageUrl = imageUrl;
        return product.save();
    }).then(() => {
        console.log('UPDATED PRODUCT');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    });
};

exports.postDeleteProduct = (req, res) => {
    const { productId } = req.params;
    Product.findByIdAndDelete(productId).then(() => {
        console.log('DELETED PRODUCT');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    });
}

exports.getProducts = (req, res, next) => {
    Product.find()
        // .populate('userId')
        .then(products => {
            console.log(products);
            res.render('admin/products', {
                path: '/admin/products',
                pageTitle: 'Admin Products',
                prods: products,
                isAuthenticated: req.session.isLoggedIn
            })
        }).catch(err => console.log(err));
};