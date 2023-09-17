const express=require("express");
const app=express();
const cookieParser=require("cookie-parser");
const bodyParser=require("body-parser");
const fileUpload=require("express-fileupload");
const errorMiddleware=require('./middleware/error.js');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());


//import route;

const product=require('./routes/productRoute.js');
const user =require("./routes/userRoute.js");
const order =require("./routes/orderRoute.js");


//using product route;
app.use('/api/v1',product);
app.use('/api/v1',user);
app.use("/api/v1",order);

app.use(errorMiddleware);
module.exports=app