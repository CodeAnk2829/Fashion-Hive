const express=require("express");
const ejs = require("ejs");
const app=express();
const dotenv = require('dotenv');
const cookieParser=require("cookie-parser");
const bodyParser=require("body-parser");
const fileUpload=require("express-fileupload");
const errorMiddleware=require('./middleware/error.js');



app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());
app.set("view engine", "ejs");


//import route;

const product=require('./routes/productRoute.js');
const user =require("./routes/userRoute.js");
const order =require("./routes/orderRoute.js");
const home = require('./routes/index.js');

//using product route;
app.use('/', home);
app.use('/api/v1',product);
app.use('/',user);
app.use("/api/v1",order);

app.use(errorMiddleware);

// app.listen(port, () => console.log(`Server is running on port ${port}`))
module.exports=app