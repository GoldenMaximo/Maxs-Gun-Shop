const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');
const p = path.join(rootDir, './data/products.json');

const getProductsFromFile = (callback) => {
    fs.readFile(p, (err, content) => {
        if (err) {
            return callback([]);
        }
        callback(JSON.parse(content));
    });
}

module.exports = class Product {
    constructor(title, imageUrl, description, price) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err => {
                console.log(err);
            })
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }
}