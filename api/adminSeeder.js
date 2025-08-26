const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Admin = require("./MODELS/admin");

dotenv.config({ path: "../.env" });

const seedAdmin = async () => {
  try {
    console.log("Connecting to database");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected");

    const existingAdmin = await Admin.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log(
        "Admin user already exists with email:",
        process.env.ADMIN_EMAIL
      );
      await mongoose.connection.close();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    const newAdmin = new Admin({
      _id: new mongoose.Types.ObjectId(),
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
    });

    await newAdmin.save();
    console.log("Admin user created successfully!");
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

seedAdmin();
