const { string } = require('joi');
const mongoose =require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');



const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {//virtual property
    return this.url.replace('/upload', '/upload/w_200');// by adding /w_200 to url it sets the widtn to 200 in the edit page
});


const CampgroundSchema = new Schema({ 
    type: String,
    images:[ImageSchema],
    // image: String,
    price: Number,
    description: String,
    location: String,    //.fromCharCode-idk how its been added to the code but it stops the server from starting
    
    author:[
        {
            type:Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    reviews: [
        {   
            type: Schema.Types.ObjectId,
            ref: 'Review' 
        }

    ]
});

//query middleware for deleting all the reviews associated with the campground while deleting a particular campground
CampgroundSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await Review.deleteMany({//use deleteMany instead of remove as remove function gives warning
            _id: {
                $in: doc.reviews
            }
        })

    }
})
module.exports = mongoose.model('Campground', CampgroundSchema);