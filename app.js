const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

// Import podzielonych modułów
const userRoutes = require('./backend/modules/user');
const bookRoutes = require('./backend/modules/book');
const copyRoutes = require('./backend/modules/copy');
const borrowRoutes = require('./backend/modules/borrow');

// Routing
app.use(userRoutes);
app.use(bookRoutes);
app.use(copyRoutes);
app.use(borrowRoutes);

// Main
app.listen(process.env.PORT, () => {
    console.log('Server listens on port '+ process.env.PORT);
});
