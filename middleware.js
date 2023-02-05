const { campgroundSchema } = require('./schemas.js');
const { reviewSchema } = require('./schemas.js');//joy js object schema
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){//is authenticated is an method from the passport
        //req.session.returnTo = req.originalUrl;//when ever this middleware hits req.originalUrl stores the url from where it redirects the user to the login page
        //here we store the url by creating a object reurnTo
        req.flash('error', 'you must be signed in');
        return res.redirect('/login');
    }
    next();
}
module.exports.validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);
    console.log(error);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

module.exports.isAuthor = async(req,res,next)=>{
    const{ id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author[0]._id.equals(req.user._id)){
        res.flash('error',"you don't have permission");
        return res.redirect(`campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    const{ id,reviewId } = req.params;//as params lopks like--campground/id/reviews/reviewId
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        res.flash('error',"you don't have permission");
        return res.redirect(`campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);//it is the expresserror handeler we created and exported 
    }
    else{
        next();
    }
}