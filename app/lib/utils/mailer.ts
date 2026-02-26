import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

transporter.verify((error, _success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

export async function sendWelcomeEmail(name: string, email: string) {

    await transporter.sendMail({
        from: `"Zeno" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Zeno!",
        html: `
            <h2>Welcome to Zeno!</h2>
            <p>Hey ${name}, your account has been created successfully!</p>
        `,
    });
}
