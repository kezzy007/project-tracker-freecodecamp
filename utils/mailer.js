const nodemailer = require('nodemailer');
const SITE_CONFIG = require('../env.js');

function getMailMarkup(activationUrl) {
    return `
                <h3>Hello</h3>
                <p>You account has been created on the project tracker for Freecodecamp platform. <br/>
                Please confirm your account activation by clicking on the link below

                <a href="${activationUrl}">Confirmation Link</a>
                </p>
            `;
}

module.exports.gmail = (credentials, user_mail, activation_url, callback) => {

    let mailOptions = {
        from: SITE_CONFIG.APP_MAIL, // sender address
        to: user_mail, // list of receivers
        subject: 'Account verification for project tracker (FreeCodeCamp)', // Subject line
        text: '', // plain text body
        html: getMailMarkup(activation_url) // html body
    };

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: SITE_CONFIG.APP_MAIL, // user
            pass: SITE_CONFIG.MAIL_PASS // password
        }
    });


    transporter.sendMail(mailOptions, callback);

};



