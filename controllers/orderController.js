const Order = require("../models/orderModel");
const ErrorHander = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apifeatures');

//creating order of product 
exports.newOrder =catchAsyncErrors(async (req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        ShippingPrice,
        totalPrice,
    } =req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        ShippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id,
    });
    res.status(201).json({
        success:true,
        order,
    });
});

//get single order 
exports.getSingleOrder = catchAsyncErrors(async(req,res,next)=>{
    //the working of populate get user id from order of user and find the name and email of the user
           const order =await Order.findById(req.params.id).populate(
            "user",
            "name email"
           );
           if(!order){
            return next(new ErrorHander("order is not found",400));
           }
           res.status(200).json({
            success:"true",
            order
           })

});

//all orders which is ordered by user
exports.getMyOrders = catchAsyncErrors(async(req,res,next)=>{
    //their is oredes is find by the user id which is stored int the order
           const orders =await Order.find({user:req.user._id});
           if(!orders){
            return next(new ErrorHander("order is not found",400));
           }
           res.status(200).json({
            success:"true",
            orders
        });
});
  
//get all orders by admin
exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{
    //their is oredes is find by the user id which is stored int the order
           const orders =await Order.find();
           if(!orders){
            return next(new ErrorHander("order is not found",400));
           }
           let totalamount =0;
           orders.forEach((order)=>{
            totalamount +=order.totalPrice;
           });
           res.status(200).json({
            success:"true",
            totalamount,
            orders
        });
});

exports.updateOrder = catchAsyncErrors(async(req,res,next)=>{
    //their is oredes is find by the user id which is stored int the order
           const order =await Order.findById(req.params.id);
           if(order.orderStatus ==="Delivered"){
            return next(new ErrorHander("you have already delivered",400));
           }

        order.orderItems.forEach(async(o)=>{
            await updateStock(o.product,o.quantity)
        })

        order.orderStatus =req.body.status;
        if(req.body.status ==="Delivered"){
            order.deliveredAt =Date.now();
        }

        await order.save({validateBeforeSave :false});

           res.status(200).json({
            success:"true",
            totalamount,
            order
        });
});

async function updateStock (id,quantity){
    const product =await Product.findById(id);
    product.Stock  -=quantity;
    await product.save({
        validateBeforeSave:false
    })
}

//delete order --Admin
exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{
    //their is oredes is find by the user id which is stored int the order
           const order =await Order.findById(req.params.id);
           if(!order){
            return next(new ErrorHander("order do not found with this Id",400));
           }
     await order.remove();
           res.status(200).json({
            success:true
        });
});