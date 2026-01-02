import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { Schema, model, Model, Document } from "mongoose";
import { UnauthorizedError } from "../errors/unauthorized.js";
import { JWT_SECRET } from "../utils/jwt.js";

interface IUserDocument extends Document {
    name: string;
    number: number;
    password: string;
    cart: Array<{
        food: Schema.Types.ObjectId;
        quantity: number;
    }>;
    generateAuthToken(): string;
}

interface IUserModel extends Model<IUserDocument> {
    findByCredentials(number: number, password: string): Promise<IUserDocument>;
}

const cartItemSchema = new Schema({
    food: {
        type: Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    }
}, { _id: false });

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: [4, 'Имя должно быть не менее 4 символов']
    },
    number: {
        type: Number,
        required: [true, 'Вы не ввели номер'],
        unique: [true, 'Такой номер уже занят'],
        validate: {
            validator: function(v: number) {
                const numberStr = v.toString();
                return numberStr.length === 11 && numberStr.startsWith('8');
            },
            message: 'Номер должен содержать 11 цифр и начинаться с 8'
        }
    },
    password: {
        type: String,
        required: [true, 'Вы не ввели пароль'],
        minlength: [6, 'Пароль должен быть не менее 6 символов'],
        select: false,
        validate: {
            validator: function(v: string) {
                return /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/.test(v);
            },
            message: 'Пароль должен содержать только английские символы'
        }
    },
    cart: {
        type: [cartItemSchema],
        default: []
    }
}, 
{ 
    toJSON: { 
        transform: function(_doc, ret: any) { 
            delete ret.password;
            return ret;
        } 
    }, 
    toObject: { virtuals: true }, 
    timestamps: true  
});


userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ userId: this._id }, JWT_SECRET, { expiresIn: '7d' });
}

userSchema.statics.findByCredentials = async function(number: number, password: string) {
    const user = await this.findOne({ number })
    .select('+password')
    .orFail(new UnauthorizedError('Неверный номер или пароль'));
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError('Неверный пароль');
    }
    return user;
}

const User = model<IUserDocument, IUserModel>('User', userSchema);

export default User;
