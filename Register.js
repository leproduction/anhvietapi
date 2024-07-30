const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const registerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true, // Ensures email is unique in the database
        required: true,
        trim: true,
        lowercase: true
    },
    tel: {
        type: String, // Use String to accommodate phone numbers with special characters
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

// Hook to hash password before saving to database
registerSchema.pre('save', async function(next) {
    const user = this;

    // Hash the password only if it has been modified or is new
    if (!user.isModified('password')) {
        return next();
    }

    try {
        // Generate a salt and hash the password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        next(error); // Pass the error to Mongoose to handle
    }
});

const RegisterModel = mongoose.model('Register', registerSchema);

module.exports = RegisterModel;
