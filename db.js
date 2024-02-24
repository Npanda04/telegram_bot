const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:1vaAcgcHBb6f7ygM@100xdevs.qe8nt4o.mongodb.net/telegram_bot');
const db = mongoose.connection;


// Define a mongoose model for user data
const User = mongoose.model('User', {
    chatId: Number,
    name: String,
    city: String,
    country: String,
    allowed : {
        type: Boolean,
        default: true
    }
});

const Admin = mongoose.model('Admin', {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    apiKey : {
        type: [String],
        default: ['718bce678ee85d649e8bc9766a15c326']
    },
    messageFrequency : {
        type: Number,
        default: 24
    }
});



module.exports = {User, Admin};

