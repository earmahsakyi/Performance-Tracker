const mongoose =require('mongoose');
// const process.env = require('config');
const db = process.env.get('mongoURI');

const connectDB = async () => {
    try{
        await mongoose.connect(db);
        console.log('MongoDB connected...')

    }
    catch(err){
        console.error(err.message)
        process.exit(1)
    }
};
module.exports = connectDB;