const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');


const QuestionsSchema = mongoose.Schema({

    question: {
        type: String,
        required: true
    },
    response: {
        type: String
    },
    user: {
        type: Object,
        required: true
    },
    instructor: {
        type: Object,
        required: true
    },
    answered: {
        type: Boolean,
        required: true,
        default: false
    } 

});


QuestionsSchema.plugin(timestamps);

const Questions = module.exports = mongoose.model('Questions', QuestionsSchema);




