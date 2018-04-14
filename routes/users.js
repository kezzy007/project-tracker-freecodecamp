const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mailer = require('../utils/mailer');
const SITE_CONFIG = require('../env');

// Helper libraries
const replaceDotsInEmail = require('../utils/helper-functions');

// Models
const User = require('../models/user');
const Logs = require('../models/logs');
const Projects = require('../models/projects');
const ProjectUsers =  require('../models/project_users');

// Authentication modules
const passport = require('passport');
const config = require('../config/database');
const jwt = require('jsonwebtoken');


const ROLE_ADMIN = 'ADMIN';

router.get('/register', (req, res, next) => {

    const newUser = new User({
        name: req.body.name,
        email:  req.body.email,
        username: req.body.username,
        password: req.body.password,
        role: req.body.role,
        skill: req.body.skill,
        profile_pic: req.body.profile_pic
    });

    User.addUser(newUser, (err, user) => {

        if(err){
            res.json({success: false, message: "Registration failed"});
        }
        else{

            user.password = undefined;

            activation_url = `${SITE_CONFIG.SITE_URL}/accounts/activation/${user.token}`;

            // Send mail on user registered
            mailer.gmail(SITE_CONFIG, user.email, activation_url, 
                         (error, info) => {
                           
                            if (error) {
                                 
                                console.log(error);

                                return res.json({success: false});

                            }
                                console.log('Message sent: %s', info.messageId);
                                // Preview only available when sending through an Ethereal account
                                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                                res.json({success:true, user: user, message: 'User registered', emailObject: info  });

                                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

                        });

        }

    });

});

router.post('/authenticate', (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    User.getUserByEmail(email, (err, user)=>{

        if(err) throw err;

        if(!user){
            return res.json({success:false, message:'User not found'});
        }
        else{
            //  User is containing the list of methods from user model exports
            User.comparePassword(password, user.password, (err, isMatch) => {
                
                if(err) throw err;

                if(isMatch){

                    const result = signTokenWithUser(user);

                    return res.json({
                        success: true,
                        token: 'bearer '+ result.token,
                        user: result.user
                    });

                }
                else{
                    return res.json({success: false, message:'Wrong password' });
                }

            });

        }

    });

});

router.post('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {

    return res.json({
        user : req.user
    });

});

router.post('/projects', passport.authenticate('jwt', {session:false}), (req,res, next) => {

    const user = req.body.user;


    // This returns all the projects for the admin / user
    Projects.getProjects(user, (err, projects) => {

            if(err) throw err;
            
            // This gets all the logs for the admin / user
            Logs.getLogs(user, (err, logs) => {

                if(err) throw err;

                // If user's role is user, return only the project and logs
                if(user.role.toUpperCase() !== ROLE_ADMIN){

                    return res.json({
                        success: true, 
                        projects: projects, 
                        logs: logs
                    });

                }

                // This gets all the users assigned to all projects *Only for the admin
                ProjectUsers.getAllUsers((err, projectUsers) => {

                    if(err) throw err;

                    User.getAllUsers((err, all_users) => {

                        if(err) throw err;

                        return res.json({
                            success: true, 
                            projects: projects, 
                            logs: logs,
                            all_users: all_users,
                            project_users: projectUsers
                        });

                    });

                });

            });

    });

});



// This handles google login token verification
router.post('/validate-social-login', (req, res) => {

    const userData = req.body.userData;
    const DATA_PROVIDERS = { GOOGLE: 'google', FACEBOOK: 'facebook'}; 
    var email = '';

    if(userData.provider === DATA_PROVIDERS.GOOGLE) {

        const token = req.body.userData.id_token || ''; // For verification with google
        
        email = req.body.userData.email;
        
        // Server side token verification code here

    }

    User.findOne({email: email}, (err, user) => {


        if(err) throw err;

        // If user not found return error message
        if(user === null) {
            return res.json({success: false});
        }

        if(user.activated) {

            // console.log('user activated');
            const result = signTokenWithUser(user, userData.image || '');
    
            return res.json({
                    success: true,
                    token: 'bearer '+ result.token,
                    user: result.user
                });
    
        }

        //  If user is found with email, save other user properties if available
        
        user.name = req.body.userData.name;
        user.role = user.role || 'user';
        user.activated= true;
    
        User.updateRecord( user, (err, newUser) => {

            if(err) throw err;

            console.log(newUser);

            if(!newUser) {
                return res.json({success: false});
            }

            const result = signTokenWithUser(newUser, userData.image || '');

            return res.json({
                    success: true,
                    token: 'bearer '+ result.token,
                    user: result.user
                });
                
        });

    });

});

function signTokenWithUser(user, profile_pic) {

    const tempUser = {
        "_id": user._id,
        "name": user.name,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "profile_pic": profile_pic
    };

    // Create token
    let token = jwt.sign(tempUser, config.secret, {
        expiresIn: 604800 // 1 week,
    });

    return {'token': token, 'user': tempUser };
}

router.post('/save-project', passport.authenticate('jwt', {session:false}), (req, res, next) => {

    const project = new Projects(req.body.project);


    project.save((err, project) => {

        if(err) throw err;

        if(project){
            return res.json({success: true, message: 'Projects saved', project: project});
            
        }
        else{
            return res.json({success:false, message: 'Could not save'});
        }

    });

});

router.post('/save-log', passport.authenticate('jwt', {session: false}), (req, res, next) => {

    const log = new Logs(req.body.log);

    log.save((err, log) => {

        if(err) throw err;

        console.log(log);

        return res.json({success:true, log: log});
    });

});

router.post('/delete-log', passport.authenticate('jwt', {session: false}), (req, res, next) => {

    Logs.deleteLog(req.body.logId, (err, log) => {

        if(err) throw err;

        return res.json({success: true, log:log});

    });

});

router.post('/save-admin-log-review', passport.authenticate('jwt', {session: false}), (req, res, next) => {

    Logs.saveAdminLogReview(req.body.log, (err, log) => {

        if(err) throw err;

        return res.json({success: true, log: log});

    });

});

router.post('/update-profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {

    const user = req.body.user;

    User.getUserById(user._id, (err, userObj) => {

        if(err) throw err;

        if(userObj){

            // Encrypt the new password;
            if(user.password){

                bcrypt.genSalt(10, (err, salt) => {
                
                    bcrypt.hash(user.password, salt, (err, hash) => {

                        userObj.password = hash;

                    })

                });
                
            }
            
            userObj.name = user.name;
            userObj.email = user.email;


            User.updateRecord(userObj,(err, updateStatus)=>{

                if (err) throw err;

                if(updateStatus)
                return res.json({success: true, message:'Record updated'});

                return res.json({success: false, message:'Record update failed'});

            });
        }
        else {
            return res.json({success: false, message:'User record not found'});
        }
        

    });

});

router.post('/update-profile-pic', passport.authenticate('jwt', {session: false}), (req, res, next) => {

    if(req.files) {

        const rand = Math.floor((Math.random() * 10)) + "_" + Math.floor((Math.random() * 10));

        const profilePic = req.files.fileItem;

        const profilePicName = rand + profilePic.name;
        //return res.json(__dirname + '/../uploads/profile-pics/'+ profilePicName);

        // return res.json(__dirname + '/../uploads/profile-pics/'+ profilePicName);
        
        profilePic.mv(__dirname + '/../uploads/profile-pics/'+ profilePicName, (err) => {

            if(err){

                return res.status(500).send({'success':false, 'message':err});

            } 
            else{

                User.updateProfilePicPath(req.body._id, profilePicName, (err, user) => {

                    if(err) return res.status(500).send({'success':false, 'message':err});

                    return res.json({ 
                                        "success": true, 
                                        "message": "Operation successful",
                                        "user": user
                                    });

                });

            }

        });

    }
    else{
        return res.json({"success":false, 'message':'No file found'});
    }

});

router.post('/get-all-users', passport.authenticate('jwt', {session: false}), (req, res, next) => {


    User.find({}, {password: false}, (err, users) => {

        if(err) return res.json({success: false, message: "Errors encountered", error: err});

        return res.json({success: true, users: users});

    });

});

router.post('/update-user-record', passport.authenticate('jwt', {session:false}), (req,res) => {
    
    const user = req.body;


    // Check if user's password is set
    if(user.password){

        bcrypt.genSalt(10, (err, salt) => {
                
            bcrypt.hash(user.password, salt, (err, hash) => {

                user.password = hash;

                // Update record after getting hashed password

                User.updateRecord(user, (err, newUser) => {

                    if(err) throw err;

                    return res.json({success: true, message: "Update successful", user: newUser});

                });

            })

        });

    }
    else {

        User.updateRecord(user, (err, newUser) => {

            if(err) throw err;

            return res.json({success: true, message: "Update successful", user: newUser});

        });

    }

});

router.post('/delete-users', passport.authenticate('jwt', {session: false}), (req, res) => {

    User.deleteUser(req.body._id, (err, deleteStatus) => {

        if(err) throw err;

        return res.json({success: true, message: "User successfully deleted"});

    });

});

router.post('/save-assigned-users', passport.authenticate('jwt', {session: false}), (req, res) => {


    ProjectUsers.saveAssignedUsersForProject( req.body.project_id, req.body.assignedUsers, (err, saveStatus) => {

        if(err) throw err;

        return res.json({success: true, message: 'Operation successful', status: saveStatus});

    });

});

router.post('/logout', passport.authenticate('jwt', {session: false}), (req,res) => {

    if(!req.body.user) return res.json({success: false, message: 'Logout failed'});

    req.logout();
    
    return res.json({ success: true, message: 'Logout successful'});

});


module.exports = router;
