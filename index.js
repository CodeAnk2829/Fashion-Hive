import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import findOrCreate from "mongoose-findorcreate";
import flash from "connect-flash";
import nodemailer from "nodemailer";
const app = express();
const port = 3000;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, // Your Gmail email address
        pass: process.env.PASSWORD // Your Gmail password or app-specific password
    }
});


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(session({
    secret: "The secret of profile.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Establish connection
mongoose.set("strictQuery", false);
const mongoURI = process.env.MONGO_URL;
mongoose.connect(mongoURI);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// create model for user
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// google authentication
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/fashion-hive",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/shop", (req, res) => {
    res.render("shop");
});

app.get("/contact", (req, res) => {
    res.render("contact");
});

app.get("/login", (req, res) => {
    res.render('login', { errorMessage: req.flash('error') });
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/auth/google", 
    passport.authenticate("google", { scope: ["email", "profile"]}
));

app.get( '/auth/google/profile',
    passport.authenticate( 'google', {
        successRedirect: '/profile',
        failureRedirect: '/auth/google'
}));

app.get("/profile", (req, res) => {
    if(req.isAuthenticated()) {
        res.render("profile");
    } else {
        res.redirect("/login");
    }
});

// logout
app.get("/logout", async (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get("/forgot", (req, res) => {
    res.render("forgotPass");
});

app.get("/reset-password", (req, res) => {
    res.render("reset-password");
});

app.get("/status", (req, res) => {
    res.status(400).send("Bad request");
});



// registration
app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    User.register({username: username}, password, function(err, user) {
        if(err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/");
            });
        }
    }); 
});

// login
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true // Enable flash messages for failed authentication
}));

app.post("/forgot", (req, res) => {
    // Find the user by username and send a password reset link to their email
    // Find the user by username and send a password reset link to their email
    User.findOne({ username: req.body.username }).lean()
        .then(user => {
            if (!user) {
                res.render("forgotPass", {errorMessage: "<p>Email does not exist.</p>"});
            } else {
                console.log("user found");
                console.log(user);
                console.log(req.body.username);

                const getId = user._id;
                console.log(getId);
                const resetLink = `http://localhost:3000/reset-password?_id=${encodeURIComponent(getId)}`
                // Sending email
                transporter.sendMail({
                    from: process.env.EMAIL, // Sender's email address
                    to: req.body.username, // Recipient's email address
                    subject: 'Password Reset', // Email subject
                    text: `Click the link to reset your password: ${resetLink}` // Email body
                }, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });
            }
        })
        .catch(err => {
            console.error(err);
            req.flash('error', 'An error occurred');
            res.redirect('/status');
        });
});

// Reset password
app.post("/reset-password", (req, res) => {
    
    if(req.body.newPassword != req.body.confirmPassword) {
        res.render("reset-password", {errorMessage: "*Password does not match."});
    } else {
        
        // console.log(User.findOne({_id: req.param._id}).lean());
        // Find the user and update their password
        // User.findOne({ username: req.body.username }, (err, user) => {
        //     if (err) {
        //         console.error(err);
        //         return res.redirect('/reset-password');
        //     }
    
        //     // Set the new password and save the user
        //     user.setPassword(req.body.newPassword, (err) => {
        //         if (err) {
        //             console.error(err);
        //             req.flash('error', 'An error occurred');
        //             return res.redirect('/reset-password');
        //         }
    
        //         user.save();
        //         req.flash('success', 'Password reset successful');
        //         res.redirect('/profile'); // Redirect to profile or wherever you want
        //     });
        // });
    }

});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});