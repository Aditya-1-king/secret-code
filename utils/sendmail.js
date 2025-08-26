const nodemailer = require("nodemailer");

// transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "chandrasumer280@gmail.com",
        pass: "rgkc qjhb zofy zmki" // Gmail App Password
    }
});

// Send login notification
async function sendLoginNotification(ip) {
    try {
        const loginTime = new Date().toLocaleString();
        const mailOptions = {
            from: '"Secret App" <chandrasumer280@gmail.com>',
            to: 'godcraft1924@gmail.com',
            subject: 'Access Request for Secret Message',
            text : ` Someone is trying to acess for site ${ip}`
        };

        const info = await transporter.sendMail(mailOptions);
        // console.log('Login notification sent:', info.messageId);
    } catch (error) {
        console.error('Error sending login notification:', error);
    }
}

// Send feedback / message
async function sendMessage(message, email) {
    try {
        const loginTime = new Date().toLocaleString();
        const mailOptions = {
            from: '"Secret App" <chandrasumer280@gmail.com>',
            to: 'chandrasumer280@gmail.com',
            subject: `Message from ${email} at ${loginTime}`,
            text: message
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Feedback message sent:', info.messageId);
    } catch (error) {
        console.error('Error sending feedback message:', error);
    }
}

// Export both functions
module.exports = { sendLoginNotification, sendMessage };
