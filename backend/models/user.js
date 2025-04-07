const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    lastLogin: {
        type: Date
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

// Generate auth token
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
    
    user.tokens = user.tokens.concat({ token });
    await user.save();
    
    return token;
};

// Find user by credentials
userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('Invalid login credentials');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid login credentials');
    }
    
    if (user.status === 'inactive') {
        throw new Error('Account is inactive');
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    return user;
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    
    delete userObject.password;
    delete userObject.tokens;
    
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 