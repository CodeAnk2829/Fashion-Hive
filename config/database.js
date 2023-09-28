const mongoose=require("mongoose");
const connectDatabase=()=>{
mongoose.set('strictQuery', true)
 mongoose.connect("mongodb://127.0.0.1:27017/shoppingDB",{
    
        useNewUrlParser:true,
        useUnifiedTopology:true,
       
        // useCreateIndex:true
    }).then((data)=>{
        console.log(`mongodb data is connected:${data.connection.host}`);
    }).catch((err)=>{
        console.log('err.connectiong.database'+err.message)
    })
};
module.exports=connectDatabase;