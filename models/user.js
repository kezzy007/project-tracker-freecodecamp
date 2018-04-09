const mongoose = require('mongoose');
const Timestamp = mongoose.mongo.Timestamp;

// For encryption
const bcryptjs = require('bcryptjs');

// Random token generator
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(null, UIDGenerator.BASE36, 10);


const ROLES = { ROLE_ADMIN: 'ADMIN', ROLE_USER:'USER' };

const userSchema = mongoose.Schema({
    name:{
        type: String,
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: false
    },
    role:{
        type: String,
        required: true
    },
    profile_pic: {
        type: String,
        required: false
    },
    skill: {
        type: String,
        required: false
    },
    activated: {
        type: Boolean,
        required: true,
        default: false
    },
    token: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    }
});

const User = module.exports = mongoose.model('User',userSchema);

module.exports.getAllUsers = (callback) => {

    User.find({}, {name:1, username: 1, email: 1, role: 1, skill:1}, callback);

};

module.exports.updateRecord = (userObj, callback) => {

    User.findOneAndUpdate({_id:userObj._id}, 
                            userObj, 
                            {
                                projection: {name:1, email:1, role:1, profile_pic:1, skill:1},
                                new: true
                            }, 
                             callback);

};

module.exports.updateProfilePicPath = (user_id, pic_name, callback) => {

    User.findOneAndUpdate({_id: user_id}, {profile_pic: pic_name}, {upsert: true, new: true}, callback);

}

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
};

module.exports.getUserByEmail= function(email, callback){

    const query = { email: email };

    User.findOne(query, callback);

}

module.exports.comparePassword = (inputPassword, retrievedHashedPassword, callback) => {

    bcryptjs.compare(inputPassword, retrievedHashedPassword, (err, isMatch) => {

        callback(err, isMatch);
    });

};

module.exports.addUser = function(newUser, callback){


    // Hash user's password
    bcryptjs.genSalt(10, (err, salt) => {

        bcryptjs.hash(newUser.password || '', salt, (err, hashedPassword) => {

            if(err) throw err;

            newUser.password = hashedPassword;

            // Generate a token which is used for url authentication on user account activation
            uidgen.generate((err, token) => {

                newUser.token = token;

                // Since newUser is a model object, it exhibits model properties
                newUser.save(callback);

            });

            
        });

    });

};

module.exports.deleteUser = (user_id, callback) => {
    
    User.deleteOne({_id: user_id}, callback);

};