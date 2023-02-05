if(process.env.NODE_ENV !== 'production'){//code to run the dotenv only during the development time
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');//one of a engine we use
// const { campgroundSchema, reviewSchema } = require('./schemas.js');//joi object schema validation for serverside
const methodOverride = require('method-override');
// const Campground = require('./models/campground');
// const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
// const catchAsync = require('./utils/catchAsync');
// const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const app = express();

const dbUrl = process.env.DB_URL;

// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect('mongodb://localhost:27017/yelp-camp',{//database address
    useNewUrlParser: true,
    //useCreateIndex: true,
    // strictPopulate: false,
    useUnifiedTopology: true,
    //useFindAndModify: false//comment out this if we get mongoose depreciation warning in our console
});

const db = mongoose.connection;//To handle errors after initial connection was established, you should listen for error events on the connection.
db.on("error", console.error.bind(console, "connection error:"));
db.once("open",()=>{
    console.log("Database connected!!!!");
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));//here path.join joins 2path to form a single path 

const sessionConfig = {
    name: 'session',
    secret: 'thiscouldbeabettersecret',
    resave: false,//written to deal with the warnings
    saveUninitialized: true,//written to deal with the console warnings
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,//date.now() represents todays day and the + part shows time of a week format = ms/sec/min/hr/daysin a week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}






app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());


// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dfqmvxfkf/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );



app.use(passport.initialize());
app.use(passport.session());


app.use(express.urlencoded({extended:true}));//helps in parsing the req.body and we can get the req.body
app.use(methodOverride('_method'));//we can give any name,the name that we give here we have to use that in the form during update and delete
//setup middleware for validating new campground by using the joi object schema validation
app.use(express.static(path.join(__dirname,'public' )));//tell express to serve a public directory
app.use(mongoSanitize({
    replaceWith: '_'
}))




passport.use(new LocalStrategy(User.authenticate()));//here authenticate is a pre defined method of passport-local-mongoose used to authenticate
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());//tells how to store it and unstore it on the session






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

app.use((req,res,next)=>{
    if(!['/login','/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;//here passport will deserialize the user info sucj as email and password and username and return
    res.locals.success = req.flash('success');//it will take whatever msg present in flash under the keyword success and give access of the msg to the locals under the key success
    res.locals.error = req.flash('error');
    next();
})

//routing middlewares
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)



app.get('/',(req,res)=>{
    res.render('home');
})
//section 39-410 yelp camp
// app.get('/makecampground',async (req,res)=>{
//     const camp = new Campground({type: 'my backyard', description:'cheap camping' });
//     await camp.save();
//     res.send(camp); 
// })
//the below routes are moved to the routes file
// app.get('/campgrounds', catchAsync(async (req,res)=>{
//     const campgrounds = await Campground.find({});
//     res.render('campgrounds/index',{ campgrounds });

// }))

// app.get('/campgrounds/new',catchAsync(async(req,res)=>{
//     res.render('campgrounds/new');
// }))
// app.post('/campgrounds',validateCampground, catchAsync(async (req,res,next)=>{
//     // if(!req.body.campground)throw new ExpressError('invalid inputs', 400);
//     const camp = new Campground(req.body.campground);
//     await camp.save();
//     res.redirect(`/campgrounds/${camp._id}`)
// }))

// app.get('/campgrounds/:id',catchAsync(async (req,res)=>{
//     const campground = await Campground.findById(req.params.id).populate('reviews');//here reviews is the object present at campground schema
//     res.render('campgrounds/show',{ campground });
// }))

// app.get('/campgrounds/:id/edit',catchAsync(async (req,res)=>{
//     const campground = await Campground.findById(req.params.id);
//     res.render('campgrounds/edit',{ campground });
// }))

// app.put('/campgrounds/:id',validateCampground, catchAsync(async(req,res)=>{
//     const{ id } = req.params;
//     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
//     res.redirect(`/campgrounds/${camp._id}`);
// }))

// app.delete('/campgrounds/:id',catchAsync(async (req,res)=>{
//     const{ id } = req.params;
//     const campground = await Campground.findByIdAndDelete(id);//if we use other delete methods instead of findByIdAndDelete then that is not gonna be trigger the middlrware that we use in the campground schema
//     res.redirect('/campgrounds');
// }))
// app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req,res)=>{
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     res.redirect(`/campgrounds/${campground.id}`);

// }))
// app.delete('/campgrounds/:id/reviews/:reviewId' ,catchAsync(async(req,res)=>{
//     const {id,reviewId} = req.params;
//     await Campground.findByIdAndUpdate(id, {$pull: {reviews:reviewId}});
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/campgrounds/${id}/`);
// }))
app.all('*',(req,res,next)=>{
    next(new ExpressError("page not found", 404))
})
app.use((err,req,res,next)=>{
    const{statusCode = 500} = err;
    if(!err.message) err.message = 'something went wrong';
    res.status(statusCode).render('error',{err});
    // res.send('oh boy an error!!!!!');
})

app.listen(3000,()=>{
    console.log("listening on port 3000!!!!!");
})