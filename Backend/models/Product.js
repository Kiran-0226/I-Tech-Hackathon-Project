import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
  name: String,
  age: Number,
  location: String,
  industry: String,
  purchaseDate: Date,
  price: Number
})

// IMPORTANT: specify exact collection name
export default mongoose.model("Product", productSchema, "Products")