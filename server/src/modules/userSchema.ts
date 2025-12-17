import { Schema, model } from "mongoose";

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
                const phoneRegex = /^(?:\+7|8)\s?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
                const numberStr = v.toString();
                return numberStr.length === 11 && phoneRegex.test(numberStr);
            },
            message: 'Номер должен соответствовать формату'
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
    adress: {
        type: String,
        required: true,
        minlength: [5, 'Адрес должен быть не менее 10 символов']
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

const User = model('User', userSchema);

export default User;
