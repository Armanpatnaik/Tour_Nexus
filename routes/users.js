const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport  = require('passport');
const User = require('../models/user');
const users = require('../controllers/users');


router.route('/register')
.get(/*(req,res)=>{
    res.render('users/register');
}*/users.renderRegistartionForm)
.post( catchAsync(/*async (req,res,next)=>{
    try{
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err=>{
        if(err) return next(err);
        req.flash('success','welcome to yelpcamp');
        res.redirect('/campgrounds');
    })
    
}
catch(e){
    req.flash('error',e.message);
    res.redirect('/register');
}
}*/users.registerUser));


router.route('/login')
.get(/*(req,res)=>{
    res.render('users/login');
}*/users.renderLoginPage)
.post(passport.authenticate('local', { failureFlash:true, failureRedirect: '/login'}),/*(req,res)=>{
    req.flash('success','welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';//if no url is present it takes the /campgrounds as default route
    res.redirect(redirectUrl);
    delete req.session.returnTo;

}*/users.loginUser);


router.get('/logout',/*(req,res,next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success',"good bye");
        res.redirect('/campgrounds');
      });
  
    
    
}*/users.logoutUser)
module.exports = router;