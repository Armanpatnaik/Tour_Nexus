const express = require('express'); 
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
// const { campgroundSchema } = require('../schemas.js');//moved to  middleware
const { isLoggedIn,isAuthor,validateCampground } = require('../middleware');
// const ExpressError = require('../utils/ExpressError');//moved to  middleware
//requiring controllers
const campgrounds = require('../controllers/campgrounds');
const multer  = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage })


//middlewares moved to the middleware file
// const validateCampground = (req,res,next) => {
//     const {error} = campgroundSchema.validate(req.body);
//     console.log(error);
//     if(error){
//         const msg = error.details.map(el => el.message).join(',');
//         throw new ExpressError(msg,400)
//     }else{
//         next();
//     }
// }

// const isAuthor = async(req,res,next)=>{
//     const{ id } = req.params;
//     const campground = await Campground.findById(id);
//     if(!campground.author[0]._id.equals(req.user._id)){
//         res.flash('error',"you don't have permission");
//         return res.redirect(`campgrounds/${id}`);
//     }
//     next();
// }



router.route('/')
.get( catchAsync(/*async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{ campgrounds });

}*/campgrounds.index))
.post(isLoggedIn,upload.array('image'),validateCampground, catchAsync(/*async (req,res,next)=>{
    // if(!req.body.campground)throw new ExpressError('invalid inputs', 400);
    const camp = new Campground(req.body.campground);
    campground.author = req.user._id;
    await camp.save();
    req.flash('success','succesfully creates a new campground');//here success is the keyword and rest is the message to display, msg is displayed when the flash is called for this keyword here is keyword is like category for that msg
    res.redirect(`/campgrounds/${camp._id}`)
}*/campgrounds.createCampground))


// .post(upload.array('image'),(req,res)=>{
//     console.log(req.body,req.files);//req.file if we have single in place of array
//     res.send("it worked")
// })

router.get('/new',isLoggedIn,/*(req,res)=>{
    // if(!req.isAuthenticated()){
    //     req.flash('error', 'you must be signed in');
    //     return res.redirect('/login');
    // }//shiffted to middleware.js to use in another route
    res.render('campgrounds/new');
}*/campgrounds.renderNewForm)

router.route('/:id')
.get(catchAsync(/*async (req,res)=>{
    // const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');//here reviews is the object present at campground schema, populating author gives us the author name  
    // console.log(campground);
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    })
    .populate("author");//problem with author populate,22/1/23 problem solved
    if(!campground){
            req.flash('error','campground not found');
            return res.redirect('/campgrounds')
        }
    res.render('campgrounds/show',campground );
    //example
    //res.render('campgrounds/show',{ campground , msg: req.flash("success")});
    // here we can pass the msg to show but we can use middleware to use whenever a flash req is called
}*/campgrounds.showCampgrounds))
.put(isLoggedIn,isAuthor,upload.array('image'),validateCampground, catchAsync(/*async(req,res)=>{
    const{ id } = req.params;
   // const campground = await Campground.findById(id);
   // if(!campground.author[0]._id.equals(req.user._id)){
   //     res.flash('error',"you don't have permission");
   //     return res.redirect(`campgrounds/${id}`);
   // }
   const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
   req.flash('success','succesfully updated the campground');
   res.redirect(`/campgrounds/${camp._id}`);
}*/campgrounds.renderUpdateForm))
.delete(isLoggedIn,isAuthor,catchAsync(/*async (req,res)=>{
    const{ id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);//if we use other delete methods instead of findByIdAndDelete then that is not gonna be trigger the middlrware that we use in the campground schema
    // if(!campground.author[0]._id.equals(req.user._id)){
    //     res.flash('error',"you don't have permission");
    //     return res.redirect(`campgrounds/${id}`);
    // }
    req.flash('success','succesfully deleted the campground');
    res.redirect('/campgrounds');
}*/campgrounds.deleteCampground))

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(/*async (req,res)=>{
    const{ id } = req.params;
    const campground = await Campground.findById(id);
    
    // if(!campground.author[0]._id.equals(req.user._id)){
    //     res.flash('error',"you don't have permission");
    //     return res.redirect(`campgrounds/${id}`);
    // }
    if(!campground){
        res.flash('error',"campground not found");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{ campground });
}*/campgrounds.renderEditForm))

// router.get('/logout',(req,res)=>{
//     req.logout();
//     req.flash('success',"GoodBye!");
//     res.redirect('/campgrounds');
// })

module.exports = router;