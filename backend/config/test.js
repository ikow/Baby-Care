module.exports = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/baby_care_test'
    },
    port: process.env.PORT || 5001,
    logLevel: 'error'
}; 