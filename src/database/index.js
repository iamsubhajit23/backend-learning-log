import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(
            `mongodb+srv://subhajit25:h9KFSZBwdbc0h0fB@cluster0.15czesc.mongodb.net/${DB_NAME}`);
        console.log(`MONGODB Connected !!`);
    } catch (error) {
        console.error("MONGODB Connection failed ", error);
        process.exit(1)
    }
}

export default connectDB