const mongoose = require('mongoose')
const connectionString = process.env.CONNECTION_STRING
mongoose.connect(connectionString).then((res)=>{
    console.log("CoudIn Server connected with MongoDB");
}).catch((err)=>{
    console.log("DB Connection failed!!!");
    console.log(err);
})