const express = require('express'); 
const router = express.Router({mergeParams:true});
const { validateReview,isLoggedIn,isReviewAuthor } = require('../middleware');
// const { reviewSchema } = require('../schemas.js');//moved to middleware
const Campground = require('../models/campground');
const Review = require('../models/review');
// const ExpressError = require('../utils/ExpressError');//moved to middleware
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews')




// const validateReview = (req,res,next)=>{
//     const {error} = reviewSchema.validate(req.body);
//     if(error){
//         const msg = error.details.map(el => el.message).join(',');
//         throw new ExpressError(msg,400);//it is the expresserror handeler we created and exported 
//     }
//     else{
//         next();
//     }
// }




router.post('/',isLoggedIn,validateReview, catchAsync(/*async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','created new review succesfully');
    res.redirect(`/campgrounds/${campground.id}`);

}*/reviews.createReview))
router.delete('/:reviewId',isLoggedIn,isReviewAuthor ,catchAsync(/*async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','succesfully deleted the review');
    res.redirect(`/campgrounds/${id}/`);
}*/reviews.deleteReview))


module.exports = router;