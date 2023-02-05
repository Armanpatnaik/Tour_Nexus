const User = require('../models/user');

module.exports.renderRegistartionForm = (req,res)=>{
    res.render('users/register');
}

module.exports.registerUser = async(req,res,next)=>{
    try{
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err=>{
        if(err) return next(err);
        req.flash('success','welcome to Travel Guru');
        res.redirect('/campgrounds');
    })
    
}
catch(e){
    req.flash('error',e.message);
    res.redirect('/register');
}
}


module.exports.renderLoginPage = (req,res)=>{
    res.render('users/login');
}

module.exports.loginUser = (req,res)=>{
    req.flash('success','welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';//if no url is present it takes the /campgrounds as default route
    res.redirect(redirectUrl);
    delete req.session.returnTo;

}

module.exports.logoutUser = (req,res,next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success',"good bye");
        res.redirect('/campgrounds');
      });
  
    
    
}