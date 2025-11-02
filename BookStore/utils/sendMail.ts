require('dotenv').config();
import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMail = async (options: EmailOptions): Promise<void> => {

  const { email, subject, template, data } = options;

  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: true,
    auth:{
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

    const templatePath = path.join(__dirname,'../mails',template);

    const html:string = await ejs.renderFile(templatePath,data);

   const mailOptions = {
  from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_MAIL}>`,
  to: email,
  subject,
  html
};


    await transporter.sendMail(mailOptions);

};

export default sendMail;
