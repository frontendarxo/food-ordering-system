import { Schema, model } from "mongoose";
export const foodSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    inStock: {
        type: Boolean,
        required: true
    }
});
const Food = model('Food', foodSchema);
export default Food;
