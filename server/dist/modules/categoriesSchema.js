import { Schema, Types, model } from "mongoose";
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
        required: true
    }
});
const Categories = model('Categories', categoriesSchema);
export default Categories;
