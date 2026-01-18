import { Schema, model } from "mongoose";
const orderItemSchema = new Schema({
    food: {
        type: Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: false });
const orderSchema = new Schema({
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                const numberStr = v.replace(/\D/g, '');
                return numberStr.length === 11 && numberStr.startsWith('8');
            },
            message: 'Номер должен содержать 11 цифр и начинаться с 8'
        }
    },
    items: {
        type: [orderItemSchema],
        required: true
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryMethod: {
        type: String,
        enum: ['самовызов', 'доставка'],
        required: true
    },
    address: {
        type: String,
        required: function () {
            return this.deliveryMethod === 'доставка';
        },
        minlength: [5, 'Адрес должен быть не менее 5 символов']
    },
    paymentMethod: {
        type: String,
        enum: ['наличка', 'карта'],
        required: true
    },
    location: {
        type: String,
        enum: ['шатой', 'гикало'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    statusChangedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Виртуальное свойство для форматированной даты создания
// orderItemSchema не содержит created_at, виртуальные поля ссылаются на несуществующее свойство.
// Если нужно форматировать created_at, это должно делаться на уровне orderSchema.
// Ниже пример виртуального свойства для orderSchema, а старое убрано:
orderSchema.virtual('formatted_created_at').get(function () {
    if (!this.created_at)
        return null;
    const date = new Date(this.created_at);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
});
orderSchema.virtual('formatted_created_at_full').get(function () {
    if (!this.created_at)
        return null;
    const date = new Date(this.created_at);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    return date.toLocaleString('ru-RU', options).replace(',', '');
});
orderSchema.virtual('formatted_status_changed_at').get(function () {
    if (!this.statusChangedAt)
        return null;
    const date = new Date(this.statusChangedAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
});
const Order = model('Order', orderSchema);
export default Order;
