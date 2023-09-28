const Product = require('../models/productModel');
const ErrorHander = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apifeatures');

// create product --Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    //user id of creater is saved in product database 
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    })
});

//to getting all products
exports.getAllProducts = async (req, res) => {
    try {
        const resultPerPage = 4;
        const productsCount = await Product.countDocuments();

        // Assuming that req.query contains filtering and search parameters
        // You should customize the ApiFeatures class as needed
        const apiFeature = new ApiFeatures(Product.find(), req.query)
            .search()
            .filter()
            .pagination(resultPerPage);

        const products = await apiFeature.query;

        const filteredProductsCount = products.length;

        res.status(200).json({
            success: true,
            products,
            productsCount,
            resultPerPage,
            filteredProductsCount,
        });
    } catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

//getting single product;
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHander("product not found", 400));
    }
    res.status(200).json({
        success: true,
        product
    })
});

//to update products;
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(500).json({
            success: false,
            message: "Product not found"
        })
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    })
});

//remove product;
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(500).json({
            success: false,
            message: "product not found"
        })
    }
    await product.remove()
    res.status(200).json({
        success: true,
        message: "product deleted successfully"
    })
});


//create new review or update the review
exports.createProductReview =catchAsyncErrors(async(req,res,next)=>{
    const {rating,comment,productId}=req.body;
    const review = {
        user:req.user._id,
        name:req.user.name,
        rating :Number(rating),
        comment,
    };
    const product =await Product.findById(productId);


    const isReviewed =product.reviews.find(
        (rev)=> rev.user.toString() === req.user._id.toString()
    );
    if(isReviewed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString()===req.user._id.toString)
        {
            (rev.rating=rating),(rev.comment =comment);
        }
        });
       
    }
    else{
        product.reviews.push(review);
        product.numOfReviews =product.reviews.length
    }
    let avg=0;
    product.reviews.forEach((rev)=>{
        avg +=rev.rating;
    });
    product.ratings=avg/product.reviews.length

    await product.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
        message:"succeful"
    })
});


//get all reviews of a products
exports.getProductReviews =catchAsyncErrors(async(req,res,next)=>{
    const product =await Product.findById(req.query.id);
    if(!product)
    return next(new ErrorHander("product not found",404));
    res.status(200).json({
        success:true,
        reviews:product.reviews,

    });
});
//delete reviews;
exports.deleteReview = catchAsyncErrors(async(req,res,next)=>{
    const product =await Product.findById(req.query.productId);
    if(!product){
        return next(new ErrorHander("product not found",404));
    }

    const reviews =product.reviews.filter(
        (rev)=>rev._id.toString()!==req.query.id.toString()
    );
    let avg=0;
    reviews.forEach((rev)=>{
        avg +=rev.rating;
    });
    const ratings = avg/reviews.length;
    const numOfReviews =reviews.length;
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews,
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })
    res.status(200).json({
        success:true,
    });
});

