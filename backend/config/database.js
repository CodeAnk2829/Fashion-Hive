const mongoose=require("mongoose");
const connectDatabase=()=>{
mongoose.set('strictQuery', true)
 mongoose.connect(process.env.DB_URL,{
    
        useNewUrlParser:true,
        useUnifiedTopology:true,
       
        // useCreateIndex:true
    }).then((data)=>{
        console.log(`mongodb data is connected:${data.connection.host}`);
    }).catch((err)=>{
        console.log('err.connectiong.database'+err.message)
    })
};
module.exports=connectDatabase