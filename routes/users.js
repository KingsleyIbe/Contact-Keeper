const express = require('express');
 const router = express.Router();
 const { check, validationResult } = require('express-validator');
 const bcrypt = require('bcryptjs');
 const jwt = require('jsonwebtoken');
 const config = require('config');


 const User = require('../models/User');

//  router.post();

 //@route  Post api/users 
 //@desc   Register a user 
 //@access  Public
//  router.post('/', (req, res) =>{
//      res.json(req.body);
//  });

 router.post('/', [
     check('name', 'Please add name')
     .not()
     .isEmpty(),
     check('email', 'Please include a valid email').isEmail(),
     check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
 ],
 
 async (req, res)=>{
    //  res.send(req.body);
     const errors = validationResult(req);
     if (!errors.isEmpty()){
         return res.status(400).json({ errors: errors.array()});

     }
    //  res.send('Passed');
    const { name, email, password } = req.body;

    try{
        let user = await User.findOne({ email }); 
        if(user){
            return res.status(400).json({ msg: 'User already exist' });

        }
        user = new User({
            name,
            email,
            password
        });
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);
        
        await user.save();

        const payload = {
            user: {
                id: user.id
            }

        }

        const token = jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 360000 })
             res.json({ token })
    }catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');

    }
 }
 );

 module.exports = router;