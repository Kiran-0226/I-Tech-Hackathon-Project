import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  location: {
    type: String
  },
  industry: {
    type: String
  },
  purchaseDate: {
    type: Date
  },
  price: {
    type: Number
  }
},
{
  timestamps: true
}
)

// Use exact collection name
const Product = mongoose.model("Product", productSchema, "Products")

export default Product