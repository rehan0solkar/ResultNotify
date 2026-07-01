import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("VERIFY ERROR:", error);
  } else {
    console.log("SERVER READY");
  }
});

export const sendResultNotification = async (
  to,
  title
) => {

  try {

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to,

      subject: "New Mumbai University Result Published",

      html: `
        <h2>ResultNotify</h2>

        <p>
          A new result matching your subscription
          has been published.
        </p>

        <h3>${title}</h3>
        <a href="${pdfUrl}">View Result PDF</a><br><br>
        <h4>For more details visit site : </h4>
        <a href="https://result-notify.vercel.app">
        ResultNotify
        </a>
      `,
    });

    console.log(
      `Email sent to ${to}`
    );

  } catch (error) {

    console.log(
      "Mail error:",
      error.message
    );

    throw error;
  }
};