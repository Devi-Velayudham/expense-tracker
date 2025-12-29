import mongoose from "mongoose";

// STEP 1: Define the structure (schema)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true, // no two users can have same email
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String, // will store the URL/path of profile photo
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// STEP 2: Create mongoose model
const User = mongoose.model("User", userSchema);

export default User;
