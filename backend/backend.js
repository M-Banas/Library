const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Import podzielonych modułów
const userRoutes = require('./modules/user');
const bookRoutes = require('./modules/book');
const copyRoutes = require('./modules/copy');
const borrowRoutes = require('./modules/borrow');

// Routing
app.use(userRoutes);
app.use(bookRoutes);
app.use(copyRoutes);
app.use(borrowRoutes);

// Main
app.listen(5201, () => {
    console.log('Server listens on port 5201');
});
