const mongoose = require('mongoose');

const ProjectUsersSchema = mongoose.Schema({
    
    project_id: {
        type: String,
        required: true
    },

    user: {
        type: Object,
        required: true
    }
});

const ProjectUsers = module.exports = mongoose.model('ProjectUsers', ProjectUsersSchema);

module.exports.getAllUsers = (callback) => {

    ProjectUsers.find({},{_id:false, project_id: true, user: true}, callback);

}


module.exports.getProjectsAssignedToUser = (user, callback) => {

    ProjectUsers.find({ user: user },{_id:false, project_id: true, user: true}, callback);

}

module.exports.saveAssignedUsersForProject = (project_id, projAssUsers, callback) => {

    console.log(projAssUsers);

    ProjectUsers.deleteMany({project_id: project_id}, (err) => err);

    ProjectUsers.insertMany( projAssUsers, callback);

}