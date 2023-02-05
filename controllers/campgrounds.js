const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{ campgrounds });

}

module.exports.renderNewForm = (req,res)=>{res.render('campgrounds/new');
}

module.exports.createCampground = async (req,res,next)=>{
    // if(!req.body.campground)throw new ExpressError('invalid inputs', 400);
    const camp = new Campground(req.body.campground);
    camp.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    camp.author = req.user._id;
    await camp.save();
    req.flash('success','succesfully creates a new Destination');//here success is the keyword and rest is the message to display, msg is displayed when the flash is called for this keyword here is keyword is like category for that msg
    res.redirect(`/campgrounds/${camp._id}`)
}


module.exports.showCampgrounds = async (req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    })
    .populate("author");//problem with author populate,22/1/23 problem solved
  
    if(!campground){
            req.flash('error','Destination not found');
            return res.redirect('/campgrounds');
        }
    res.render('campgrounds/show',{ campground /*, msg: req.flash("success")*/});// here we can pass the msg to show but we can use middleware to use whenever a flash req is called
}

module.exports.renderEditForm = async (req,res)=>{
    const{ id } = req.params;
    const campground = await Campground.findById(id);
    
    // if(!campground.author[0]._id.equals(req.user._id)){
    //     res.flash('error',"you don't have permission");
    //     return res.redirect(`campgrounds/${id}`);
    // }
    if(!campground){
        res.flash('error',"Destination not found");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{ campground });
}


module.exports.renderUpdateForm = async(req,res)=>{
    const{ id } = req.params;
   // const campground = await Campground.findById(id);
   // if(!campground.author[0]._id.equals(req.user._id)){
   //     res.flash('error',"you don't have permission");
   //     return res.redirect(`campgrounds/${id}`);
   // }
   const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
 //    camp.images = req.files.map(f => ({url: f.path, filename: f.filename}));//this creates a new array inside the existing array to avoid that we have to use the beloe mentioned code
    const imgs =req.files.map(f => ({url: f.path, filename: f.filename}));
    camp.images.push(...imgs);//spread operator
   await camp.save();
   if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
    }
    await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })//deletes only the selected image from the array of images
}
   req.flash('success','succesfully updated the Destination');
   res.redirect(`/campgrounds/${camp._id}`);
}


module.exports.deleteCampground = async (req,res)=>{
    const{ id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);//if we use other delete methods instead of findByIdAndDelete then that is not gonna be trigger the middlrware that we use in the campground schema
    // if(!campground.author[0]._id.equals(req.user._id)){
    //     res.flash('error',"you don't have permission");
    //     return res.redirect(`campgrounds/${id}`);
    // }
    req.flash('success','succesfully deleted the Destination');
    res.redirect('/campgrounds');
}