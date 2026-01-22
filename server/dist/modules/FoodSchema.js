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
    },
    // В каких центрах доступно блюдо
    locations: {
        type: [String],
        enum: ['шатой', 'гикало'],
        default: ['шатой', 'гикало']
    },
    // Наличие по каждому центру
    stockByLocation: {
        type: Map,
        of: Boolean,
        default: () => new Map([['шатой', true], ['гикало', true]])
    }
});
const Food = model('Food', foodSchema);
export default Food;
