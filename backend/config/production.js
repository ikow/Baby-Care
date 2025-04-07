module.exports = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/baby-tracker'
    },
    server: {
        port: process.env.PORT || 50011,
        jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
        jwtExpiresIn: '7d'
    },
    logging: {
        level: 'info',
        filename: '/usr/src/app/logs/server.log'
    },
    backup: {
        directory: '/usr/src/app/backups',
        frequency: '0 0 * * *', // Daily at midnight
        retention: 7 // Keep backups for 7 days
    }
} 