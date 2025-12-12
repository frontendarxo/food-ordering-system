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
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, { 
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
  },
);

// Виртуальное свойство для форматированной даты создания
// orderItemSchema не содержит created_at, виртуальные поля ссылаются на несуществующее свойство.
// Если нужно форматировать created_at, это должно делаться на уровне orderSchema.
// Ниже пример виртуального свойства для orderSchema, а старое убрано:
orderSchema.virtual('formatted_created_at').get(function(this: any) {
    if (!this.created_at) return null;

    const date = new Date(this.created_at);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year}, ${hours}:${minutes}`;
});

orderSchema.virtual('formatted_created_at_full').get(function(this: any) {
    if (!this.created_at) return null;

    const date = new Date(this.created_at);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    return date.toLocaleString('ru-RU', options).replace(',', '');
});

const Order = model('Order', orderSchema);

export default Order;