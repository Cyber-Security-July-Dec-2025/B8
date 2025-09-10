import mongoose from "mongoose";

async function connect() {
    try {
        mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected");
    } catch (error) {
        console.log(error);
    }
}

export default connect;