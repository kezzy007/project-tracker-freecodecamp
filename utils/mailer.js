let activationUrl = '';
let userMail = '';

let mailOptions = {
    from: '"Administrator @ Project Tracker for FreecodeCamp" <foo@example.com>', // sender address
    to: userMail, // list of receivers
    subject: 'Account verification for project tracker (FreeCodeCamp)', // Subject line
    text: '', // plain text body
    html: getMailMarkup() // html body
};

function getMailMarkup() {
    return `
                <h3>Hello</h3>
                <p>You account has been created on the project tracker for Freecodecamp platform. <br/>
                Please confirm your account activation by clicking on the link below

                <a href="${activationUrl}">Confirmation Link</a>
                </p>
            
            `;
}

module.exports.gmail = (credentials, user_mail, activation_url, callback) => {

    this.activationUrl = activation_url;
    this.userMail = user_mail;

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: credentials.MAIL_USER, // user
            pass: credentials.MAIL_PASS // password
        }
    });

    transporter.sendMail(mailOptions, callback);

};



