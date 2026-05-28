import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,        // convert email to lowercase
    trim: true,            // remove whitespace
    match: /.+\@.+\..+/   // simple email validation regex
  },
  authProvider: { // Tells your app how this user account was created: "local" or "google".
    type: String,               
    enum: ["local", "google"], // auth providers OAuth2.0 google and local
    required: true,
    default: "local"
 },
  googleId: {   // Used to reliably match the same Google account every time user logs in with Google.
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: function(){
        return this.authProvider === "local"; // password is required only for local auth
    },
    minlength: 6,
    select: false // exclude password from query results by default
  }
}, {
  timestamps: true
});

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;