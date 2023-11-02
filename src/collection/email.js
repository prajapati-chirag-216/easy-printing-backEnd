const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);

const sendWelcomeEmail = (name, email) => {
  sgMail.send({
    to: email,
    from: "prajapatichirag2162003@gmail.com",
    subject:
      "Welcome to Safe Printing - Your Go-To Platform for Printing and File Management",
    html: `<h2>Welcome to the Safe Printing, ${name}</h2>
    <p> Your go-to platform for printing and file management.
      We're excited to have you on board as a new administrator and look forward to
      helping you manage your printing needs with ease.
    </p>
    <p>
      Here are a few key features and tools that you can access as an administrator
      on our site:
    </p>
    <ul>
      <li>
        User Management: You can view the list of registered users, approve or
        reject new user registrations, and manage the access rights of existing
        users
      </li>
      <li>
        File Management: You can view, and print files uploaded by users, and see a
        summary of the total number of files and users on the site.
      </li>
      <li>
        QR Code Generation: A QR code is generated for your shop and files uploaded
        by users, making it easy for them to access and print their files using QR
        code scanning.
      </li>
      <li>
        Site Statistics: You can view detailed site statistics, such as the number
        of files uploaded, the number of users registered, and the total number of
        prints made.
      </li>
    </ul>
    <p>
      If you have any questions or need assistance, our support team is available
      24/7 to help. Just send us an email at [support email address] or give us a
      call at [support phone number].
    </p>
    <p>Thank you for choosing Safe Printing, and we look forward to serving you.</p>
    `,
  });
};

const sendCancelationEmail = (name, email) => {
  sgMail.send({
    to: email,
    from: "prajapatichirag2162003@gmail.com",
    subject: "Sorry to see you go!",
    text: `Good Bye, ${name}.I hope to see you back soon.`,
    html: `<h1>You have successfully logged out from Safe Printing.</h1>
    <h2>Hey ${name} ,</h2>
    <p> We hope that you found our services helpful and that you were able to achieve what you needed to during your visit.</p>
    <p>Please note that if you have any further printing needs or questions, our customer support team is always here to assist you. You can reach us through our contact page, which can be found on our website.</p>
    <p><b>Thank you for choosing our Xerox printing site. We appreciate your business and hope to see you again soon.</b></p>`,
  });
};

const sendResetPasswordEmail = (name, email, url) => {
  sgMail.send({
    to: email,
    from: "prajapatichirag2162003@gmail.com",

    subject: `Hey ${name}, Now you can simply reset your password from belo link.`,
    // text: url,
    html: `<h1>Hey ${name}</h1>
    <p>
      We received a request to reset your password. If you didn't make this request,
      please ignore this email.
    </p>
    <p>To reset your password, please click on the button below:</p>
    <p>
      <a href="${url}"><button >Reset Password</button></a>
    </p>
    <p>Link is valide for 5 minitus.</p>`,
  });
};

const sendOtp = (name, email) => {
  const no = Math.random() + "";
  let OTP;

  if (no.startsWith("0.0")) OTP = parseInt((0.1 + no * 1) * 10000);
  else OTP = parseInt(no * 10000);

  sgMail.send({
    to: email,
    from: "prajapatichirag2162003@gmail.com",
    subject: "thanks for joining in ..",
    text: `hii ${name},your one time otp is ${OTP}`,
  });
  return OTP;
};
module.exports = {
  sendOtp,
  sendWelcomeEmail,
  sendCancelationEmail,
  sendResetPasswordEmail,
};
