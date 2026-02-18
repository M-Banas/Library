//JWT------------------------------------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
var refreshTokens = [];

const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'missing_token' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'token_expired' });
            }
            return res.status(401).json({ error: 'invalid_token' });
        }
        req.user = user;
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'forbidden' });
        }
        next();
    });
}

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'missing_token' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'token_expired' });
            }
            return res.status(401).json({ error: 'invalid_token' });
        }
        req.user = user;
        if (req.user.role !== 'user') {
            return res.status(403).json({ error: 'forbidden' });
        }
        next();
    });
}




module.exports = {
    router,
    authenticateAdmin,
    authenticateUser,
    accessTokenSecret,
    refreshTokenSecret,
    refreshTokens
};
