
const nodemailer = require("nodemailer");
require("dotenv").config(); // Loads environment variables from .env file
const contactMe = async (req, res) => {
	const { name, email, message, brandName, phone } = req.body;

	// -----------------------------------------
	// FIELD VALIDATION
	// -----------------------------------------
	if (!name || !email || !message || !brandName | !phone) {
		return res.status(400).json({ error: "Please fill in all fields" });
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res
			.status(400)
			.json({ error: "Please provide a valid email address" });
	}

	// -----------------------------------------
	// HOSTINGER EMAIL ACCOUNTS (3 BRANDS)
	// -----------------------------------------
	const EMAIL_ACCOUNTS = {
		risky: {
			user: process.env.RISKY_USER,
			pass: process.env.RISKY_PASS,
		},
		monsini: {
			user: process.env.MONSINI_USER,
			pass: process.env.MONSINI_PASS,
		},
		azure: {
			user: process.env.AZURE_USER,
			pass: process.env.AZURE_PASS,
		},
	};

	// -----------------------------------------
	// SELECT ACCOUNT BASED ON BRAND NAME
	// -----------------------------------------
	let selectedAccount;

	const brand = brandName.toLowerCase();

	if (brand.includes("risky")) selectedAccount = EMAIL_ACCOUNTS.risky;
	else if (brand.includes("monsini")) selectedAccount = EMAIL_ACCOUNTS.monsini;
	else if (brand.includes("azure")) selectedAccount = EMAIL_ACCOUNTS.azure;
	else {
		return res.status(400).json({ error: "Invalid brand name" });
	}

	// -----------------------------------------
	// SEND EMAIL
	// -----------------------------------------
	try {
		const transporter = nodemailer.createTransport({
			host: "smtp.hostinger.com",
			port: 465,
			secure: true, // SSL
			auth: {
				user: selectedAccount.user,
				pass: selectedAccount.pass,
			},
		});

		// HTML EMAIL CONTENT
		const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New Contact Form Submission</title>
<style>
    body {
        margin: 0;
        padding: 0;
        background: #f4f4f4;
        font-family: Arial, Helvetica, sans-serif;
    }

    .email-wrapper {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    }

    .header {
        background: #000;
        padding: 30px;
        text-align: center;
        color: white;
    }

    .header h1 {
        margin: 0;
        font-size: 22px;
        letter-spacing: .5px;
    }

    .content {
        padding: 30px;
    }

    .content h2 {
        font-size: 20px;
        margin-bottom: 15px;
        color: #333;
    }

    .info-box {
        background: #fafafa;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #e5e5e5;
        margin-bottom: 20px;
    }

    .info-box p {
        margin: 8px 0;
        font-size: 15px;
    }

    .label {
        font-weight: bold;
        color: #555;
    }

    .message-box {
        background: #ffffff;
        padding: 10px 20px 20px 20px;
        border-radius: 8px;
        border: 1px solid #eee;
        white-space: pre-line;
    }

    .footer {
        background: #f1f1f1;
        padding: 18px;
        text-align: center;
        font-size: 12px;
        color: #777;
    }

</style>
</head>

<body>
    <div class="email-wrapper">

        <div class="header">
            <h1>New Contact Form Submission</h1>
        </div>

        <div class="content">
            <h2>Contact Details</h2>

            <div class="info-box">
                <p><span class="label">Name:</span> ${name}</p>
                <p><span class="label">Email:</span> <a href="mailto:${email}">${email}</a></p>
				<p><span class="label">Phone Number:</span> ${phone}</p>
                <p><span class="label">Brand:</span> ${brandName}</p>
                <p><span class="label">Date:</span> ${new Date().toLocaleString()}</p>
            </div>

            <h2>Message</h2>
            <div class="message-box">
                ${message.replace(/\n/g, "<br>")}
            </div>
        </div>

        <div class="footer">
            This email was automatically generated from the ${brandName} website.
        </div>
    </div>
</body>
</html>
`;

		// EMAIL OPTIONS
		const mailOptions = {
			from: `"${brandName} Admin" <${selectedAccount.user}>`,
			replyTo: email,
			to: selectedAccount.user, // sends to brand inbox
			subject: `📧 New Contact Form Submission - ${brandName}`,
			html: htmlContent,
			text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone Number: ${phone}
Brand: ${brandName}
Message:
${message}

-------------------------------
Sent automatically from ${brandName}
	`,
		};

		// SEND EMAIL
		await transporter.sendMail(mailOptions);

		res.status(200).json({
			success: true,
			message: "Message sent successfully!",
		});
	} catch (error) {
		console.error("Email sending error:", error);

		res.status(500).json({
			error: "Failed to send message: " + error.message,
		});
	}
};
const newSubscriber = async (req, res) => {
	const { brandName, email } = req.body;

	if (!brandName || !email) {
		return res
			.status(400)
			.json({ error: "Please provide brand name and email" });
	}

	const EMAIL_ACCOUNTS = {
		risky: {
			user: process.env.RISKY_USER,
			pass: process.env.RISKY_PASS,
		},
		monsini: {
			user: process.env.MONSINI_USER,
			pass: process.env.MONSINI_PASS,
		},
		azure: {
			user: process.env.AZURE_USER,
			pass: process.env.AZURE_PASS,
		},
	};

	// -----------------------------------------
	// SELECT ACCOUNT BASED ON BRAND NAME
	// -----------------------------------------
	let selectedAccount;

	const brand = brandName.toLowerCase();

	if (brand.includes("risky")) selectedAccount = EMAIL_ACCOUNTS.risky;
	else if (brand.includes("monsini")) selectedAccount = EMAIL_ACCOUNTS.monsini;
	else if (brand.includes("azure")) selectedAccount = EMAIL_ACCOUNTS.azure;
	else {
		return res.status(400).json({ error: "Invalid brand name" });
	}

	try {
		const transporter = nodemailer.createTransport({
			host: "smtp.hostinger.com",
			port: 465,
			secure: true, // SSL
			auth: {
				user: selectedAccount.user,
				pass: selectedAccount.pass,
			},
		});

		const mailOptions = {
			from: `"${brandName} Admin" <${selectedAccount.user}>`,
			replyTo: email,
			to: selectedAccount.user, // sends to brand inbox
			subject: `🆕 New Subscriber: ${brandName}`,
			text: `
        A new subscriber has joined your mailing list!
        ----------------------------------------------
        Brand Name: ${brandName}
        Email: ${email}
      `,
		};

		await transporter.sendMail(mailOptions);
		res
			.status(200)
			.json({ success: true, message: "Subscription email sent to admin" });
	} catch (error) {
		console.error("Subscription error:", error);
		res
			.status(500)
			.json({ error: "Failed to send subscription message: " + error.message });
	}
};

module.exports = {
	contactMe,
	newSubscriber,
};
