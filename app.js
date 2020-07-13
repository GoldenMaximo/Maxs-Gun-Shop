const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const notFoundRoute = require('./routes/not-found');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(notFoundRoute);

Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
});

User.hasMany(Product);

sequelize.sync({
    force: true
}).then(result => {
    // console.log(result);
    app.listen(3000);
}).catch(err => {
    console.log(err);
});