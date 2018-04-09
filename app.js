const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const config = require('./config/database');
const passportJwtConfig = require('./config/passport');
const fileUpload = require('express-fileupload');



// Connect to mongoose
mongoose.connect(config.database);


//  On mongoose db connection
mongoose.connection.on("connected", () => {
    console.log("connected");
});

mongoose.connection.on('error', (err) => { console.log('Errors encountered '+ err) });

const app = express();
const users = require('./routes/users');

// Configure express file uploader
app.use(fileUpload());

// CORS Middleware
app.use(cors());

// Body Parser Middleware
app.use(bodyParser.json());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passportJwtConfig(passport);


app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req,res) => res.send("Home page here"));

app.use('/users', users);

const port = 3200;

app.listen(port, ()=> "Server is running");