//user----------------------------------------------------------------------------------------------------
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const client = require('./baza');
const jwt = require('jsonwebtoken');
const { authenticateAdmin } = require('./jwt');
const {refreshTokens} = require('./jwt');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;


router.post('/user/add', async (req, res) => {
    const result = await client.query('SELECT * FROM users Where email=$1',[req.body.email]);
    if(result.rowCount!=0){
        res.send('User with this email already exists!');
        return;
    }
    password=req.body.password;
    var hasLength = password.length >= 8;
    var hasUppercase = /[A-Z]/.test(password);
    var hasLowercase = /[a-z]/.test(password);
    var hasNumber = /[0-9]/.test(password);
    var hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    var allValid = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

    var email=req.body.email;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var isValid = emailRegex.test(email);

    if(allValid&&isValid){
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    var response = await client.query("Insert into users (name,lname,email,password) values ($1,$2,$3,$4)",[req.body.name,req.body.lname,req.body.email,hashedPassword]);  
    res.send(response.rows[0]);
    }
    else{
        res.send('email lub hasło nie spełnia wymagań');        
    }
});

//testowe email:'a' haslo:'a'
router.post('/user/login', async (req, res) => {
    const response = await client.query('SELECT * FROM users Where email=$1',[req.body.email]);
    if(response.rowCount!=0){
    const user=response.rows[0];
    if(await bcrypt.compare(req.body.password,user.password)){
        const role=user.is_admin ? "admin" : "user";
        const accessToken = jwt.sign({ id: user.id, role: role }, accessTokenSecret, { expiresIn: '5m' });
        const refreshToken = jwt.sign({ id: user.id, role: role }, refreshTokenSecret,{ expiresIn: '7d'});
        refreshTokens.push(refreshToken);
        const userData = {
            role: role,
            user_id: user.id,
            name: user.name,
            email: user.email,
            accessToken:accessToken,
            refreshToken:refreshToken,
        };
        res.json(userData);
    }
    else{
        res.send("Wrong creditials");
    }
    }
    else{
        res.send("Wrong creditials");
    }
    
});

router.get('/user/load',authenticateAdmin, async (req, res) => {
    const result = await client.query('SELECT * FROM users');
    res.json(result.rows);
});

router.post('/token', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.sendStatus(401);
    }
  
    if (!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(403);
    }
  
    jwt.verify(refreshToken, refreshTokenSecret, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
  
        const accessToken = jwt.sign({ username: user.username, role: user.role }, accessTokenSecret, { expiresIn: '5m' });
  
        res.json({
            accessToken
        });
    });
});


module.exports = router;
