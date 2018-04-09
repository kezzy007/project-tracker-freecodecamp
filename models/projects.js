const mongoose = require('mongoose');
const ProjectUsers = require('./project_users');

const projectsSchema = mongoose.Schema({

    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }

});

const Projects = module.exports = mongoose.model('Projects', projectsSchema);

module.exports.getProjects = (user, callback) => {

    // Check if user's role is user, YES => "get all the project assigned to user"

    if( user.role.toUpperCase() !== 'ADMIN') {

        ProjectUsers.getProjectsAssignedToUser(user, (err, project_users) => {

            Projects.find({ project_id: project_users.project_id }, callback);        

            return;
        });

    } else {
        
        // This is run primarily to fetch all projects for the admin

        Projects.find({}, callback);

    }


};