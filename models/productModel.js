const mongoose=require("mongoose");
const productSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter product name"],
        trim:true
    },
     description:{
        type:String,
        required:[true,"please enter product description"]
     },
     price:{
        type:Number,
        required:[true,"please enter product price"],
        maxlength:[8,"price cannot exceed 8 character"]
     },
     ratings:{
        type:Number,
        default:0
     },
     images:[
        {
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }
    ],
    category:{
        type:String,
        required:[true,"please enter product category"],
    },
    Stock:{
        type:Number,
        required:[true,"please enter prodcut stock"],
        maxlength:[4,"stock can not exceed 4 character"],
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                //required:true,
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
//for check who is create product
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})
module.exports=mongoose.model("product",productSchema)