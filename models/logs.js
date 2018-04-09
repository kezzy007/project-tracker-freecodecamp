const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const LogsSchema = mongoose.Schema({

    "log_message":{
        type:String,
        required: true
    },
    "project_id":{
        type:String,
        required:true
    },
    "log_status": {
        type: String,
        required:true
    },
    "user":{
        type:Object,
        required:true
    },
    
});

LogsSchema.plugin(timestamps);

const Logs = module.exports = mongoose.model('Logs',LogsSchema);

module.exports.getLogs = (user, callback) => {

    if(user.role.toUpperCase() !== 'ADMIN') {

        Logs.find({user:user}, callback);    

    } else {

        Logs.find({}, callback);

    }

    

};

module.exports.deleteLog = (logId, callback) => {

    Logs.find({_id: logId}).remove(callback);

};

module.exports.saveAdminLogReview = (log, callback) => {

    Logs.findOneAndUpdate({_id: log.log_id}, {log_status: log.log_status}, {upsert:true, new:true}, callback);

};