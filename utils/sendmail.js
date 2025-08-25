const nodemailer = require("nodemailer");

// transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "chandrasumer280@gmail.com",
        pass: "nwlg ynct wesf gewx" // Gmail App Password
    }
});

// Send login notification
async function sendLoginNotification(ipAddress = "Unknown", requestId = "N/A") {
    try {
        const loginTime = new Date().toLocaleString();
        const mailOptions = {
            from: '"Secret App" <chandrasumer280@gmail.com>',
            to: 'godcraft1924@gmail.com',
            subject: 'Access Request for Secret Message',
            html: `
                <h3>Access Request Notification</h3>
                <p>Someone is trying to access your secret message.</p>
                <p><strong>Time:</strong> ${loginTime}</p>
                <p><strong>IP Address:</strong> ${ipAddress}</p>
                <p><strong>Request ID:</strong> ${requestId}</p>
                <p>
                  <a href="/approve/${requestId}" style="padding:10px;background:green;color:white;text-decoration:none;">Approve</a>
<a href="/deny/${requestId}" style="padding:10px;background:red;color:white;text-decoration:none;margin-left:10px;">Deny</a>


                </p>
            `
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
