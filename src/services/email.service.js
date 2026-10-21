// all the third party things used are stored in services

require("dotenv").config();

const nodemailer = require("nodemailer");

// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("CLIENT_ID:", process.env.CLIENT_ID);
// console.log("REFRESH_TOKEN exists:", !!process.env.REFRESH_TOKEN);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Email transporter error:", error);
    } else {
        console.log("Email is ready to send messages");
    }
});

async function sendRegistrationEmail(userEmail, name) {
    const info = await transporter.sendMail({
        from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Welcome to Backend Ledger!",
        text: `Hello ${name},

Thank you for registering at Backend Ledger. We're excited to have you on board!

Best regards,
The Backend Ledger Team`,

        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome to Backend Ledger!</h2>

                <p>Hello ${name},</p>

                <p>
                    Thank you for registering at Backend Ledger.
                    We're excited to have you on board!
                </p>

                <p>
                    Best regards,<br>
                    The Backend Ledger Team
                </p>
            </div>
        `
    });

    console.log("Email sent:", info.messageId);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = "Transaction Successful!";

    const text = `Hello ${name},

Your transaction of $${amount} to account ${toAccount} was successful.`;

    const html = `<p>Hello <b>${name}</b>,</p>
                  <p>Your transaction of <b>$${amount}</b> to account <b>${toAccount}</b> was successful.</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = "Transaction Failed";

    const text = `Hello ${name},

We regret to inform you that your transaction of $${amount} to account ${toAccount} was unsuccessful.`;

    const html = `<p>Hello ${name},</p>
                  <p>We regret to inform you that your transaction of $${amount} to account ${toAccount} was unsuccessful.</p>`;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};