import { Schema, Types, model } from "mongoose";
import Food from "./FoodSchema.js";


const categoriesSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId()
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    foods: {
        type: [Schema.Types.ObjectId],
        ref: 'Food',
        default: []
    }
})

const Categories = model('Categories', categoriesSchema)

export default Categories