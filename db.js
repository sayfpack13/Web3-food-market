const mongoose = require("mongoose")


mongoose.connect("mongodb+srv://sayfpack:sayf118498@cluster0.j9hmuj8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

const db = mongoose.connection.on("open", () => {
    console.log("MongoDB Started");
})



const foodSchema=new mongoose.Schema({
    id:Number,
    name:String,
    price:Number,
    seller:String,
    buyer:String,
    isSold:Boolean
})

const Food=mongoose.model("Food",foodSchema)

module.exports = { mongoose, db,Food }