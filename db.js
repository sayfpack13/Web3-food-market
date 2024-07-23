const mongoose = require("mongoose")


mongoose.connect("mongodb+srv://sayfpack:sayf118498@cluster0.j9hmuj8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

const db = mongoose.connection.on("open", () => {
    console.log("MongoDB Started");
})



const foodSchema = new mongoose.Schema({
    id: Number,
    contractAddress:String,
    name: String,
    price: Number,
    seller: String,
    buyer: String,
    isSold: Boolean
})


const contractSchema = new mongoose.Schema({
    address: String,
    created_at: Date
})

const Food = mongoose.model("Food", foodSchema)
const Contract = mongoose.model("Contract", contractSchema)

module.exports = { mongoose, db, Food, Contract }