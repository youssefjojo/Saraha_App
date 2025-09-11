import nodemailer from "nodemailer";    
import {EventEmitter} from "node:events";

export const sendEmail = async (
    {to,
    subject,
    html}
) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    
    transporter.sendMail({
      from : process.env.EMAIL,
      to,
      subject,
      html
    });
};

export const emitter = new EventEmitter();

emitter.on("sendEmail", (args)=>{
    console.log("sendEmail event emitted");
    console.log(args);
    sendEmail(args);
});
