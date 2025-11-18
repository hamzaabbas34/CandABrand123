// const express = require("express");
// const nodemailer = require("nodemailer");

// const router = express();

// // Create transporter
// const transporter = nodemailer.createTransport({
// 	service: "gmail",
// 	auth: {
// 		user: process.env.EMAIL_USER || "abbasbahi289@gmail.com",
// 		pass: process.env.EMAIL_PASS || "fgcx thxe pyju xadd",
// 	},
// });

// // Verify transporter
// transporter.verify((error, success) => {
// 	if (error) {
// 		console.log("Error with transporter:", error);
// 	} else {
// 		console.log("Server is ready to take messages");
// 	}
// });

// // Email template function
// const createEmailTemplate = (formData) => {
// 	const servicesList = Object.entries(formData.services)
// 		.filter(([service, selected]) => selected)
// 		.map(([service]) => {
// 			const formattedService = service
// 				.replace(/([A-Z])/g, " $1")
// 				.replace(/^./, (str) => str.toUpperCase());
// 			return `• ${formattedService}`;
// 		})
// 		.join("\n");

// 	return `
// NEW QUOTE REQUEST

// CONTACT INFORMATION:
// -------------------
// Full Name: ${formData.fullName}
// Phone: ${formData.phone}
// Email: ${formData.email}
// Preferred Contact: ${formData.preferredContact}

// VEHICLE INFORMATION:
// -------------------
// Year: ${formData.year}
// Make: ${formData.make}
// Model: ${formData.model}
// Vehicle Type: ${formData.vehicleType}
// Doors: ${formData.doors}

// SERVICES REQUESTED:
// ------------------
// ${servicesList || "No services selected"}

// SERVICE PREFERENCES:
// -------------------
// Tint Shade: ${formData.tintShade}
// Timing: ${formData.timing}
// Budget: ${formData.budget}

// ADDITIONAL INFORMATION:
// ----------------------
// ${formData.additionalInfo || "No additional information provided"}

// ---
// This email was sent from your website contact form.
//   `;
// };

// // API endpoint
// router.post("/send-quote-request", async (req, res) => {
// 	const formData = req.body;

// 	try {
// 		// Validate required fields
// 		if (!formData.fullName || !formData.phone || !formData.email) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Please fill in all required fields: name, phone, and email",
// 			});
// 		}

// 		const mailOptions = {
// 			from: process.env.EMAIL_USER || "abbasbahi289@gmail.com",
// 			to: "Thedallastintshop@gmail.com",
// 			subject: `New Quote Request from ${formData.fullName}`,
// 			text: createEmailTemplate(formData),
// 			html: createEmailHTMLTemplate(formData),
// 		};

// 		await transporter.sendMail(mailOptions);

// 		res.json({
// 			success: true,
// 			message: "Quote request sent successfully!",
// 		});
// 	} catch (error) {
// 		console.error("Error sending email:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Failed to send quote request. Please try again.",
// 		});
// 	}
// });

// // HTML email template
// const createEmailHTMLTemplate = (formData) => {
// 	const servicesList = Object.entries(formData.services)
// 		.filter(([service, selected]) => selected)
// 		.map(([service]) => {
// 			const formattedService = service
// 				.replace(/([A-Z])/g, " $1")
// 				.replace(/^./, (str) => str.toUpperCase());
// 			return `<li>${formattedService}</li>`;
// 		})
// 		.join("");

// 	return `
// <!DOCTYPE html>
// <html>
// <head>
//   <style>
//     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//     .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
//     .section { margin: 20px 0; padding: 15px; border-left: 4px solid #007bff; background: #f9f9f9; }
//     .label { font-weight: bold; color: #555; }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <div class="header">
//       <h1>New Quote Request</h1>
//       <p>From your website contact form</p>
//     </div>

//     <div class="section">
//       <h2>Contact Information</h2>
//       <p><span class="label">Full Name:</span> ${formData.fullName}</p>
//       <p><span class="label">Phone:</span> ${formData.phone}</p>
//       <p><span class="label">Email:</span> ${formData.email}</p>
//       <p><span class="label">Preferred Contact:</span> ${
// 				formData.preferredContact
// 			}</p>
//     </div>

//     <div class="section">
//       <h2>Vehicle Information</h2>
//       <p><span class="label">Year:</span> ${formData.year}</p>
//       <p><span class="label">Make:</span> ${formData.make}</p>
//       <p><span class="label">Model:</span> ${formData.model}</p>
//       <p><span class="label">Vehicle Type:</span> ${formData.vehicleType}</p>
//       <p><span class="label">Doors:</span> ${formData.doors}</p>
//     </div>

//     <div class="section">
//       <h2>Services Requested</h2>
//       ${
// 				servicesList
// 					? `<ul>${servicesList}</ul>`
// 					: "<p>No services selected</p>"
// 			}
//     </div>

//     <div class="section">
//       <h2>Service Preferences</h2>
//       <p><span class="label">Tint Shade:</span> ${formData.tintShade}</p>
//       <p><span class="label">Timing:</span> ${formData.timing}</p>
//       <p><span class="label">Budget:</span> ${formData.budget}</p>
//     </div>

//     ${
// 			formData.additionalInfo
// 				? `
//     <div class="section">
//       <h2>Additional Information</h2>
//       <p>${formData.additionalInfo}</p>
//     </div>
//     `
// 				: ""
// 		}
//   </div>
// </body>
// </html>
//   `;
// };
// module.exports = router;




const express = require("express");
const nodemailer = require("nodemailer");

const router = express();

// Create transporter
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER || "abbasbahi289@gmail.com",
		pass: process.env.EMAIL_PASS || "fgcx thxe pyju xadd",
	},
});

// Verify transporter
transporter.verify((error, success) => {
	if (error) {
		console.log("Error with transporter:", error);
	} else {
		console.log("Server is ready to take messages");
	}
});

// Email template function
const createEmailTemplate = (formData) => {
	const servicesList = Object.entries(formData.services)
		.filter(([service, selected]) => selected)
		.map(([service]) => {
			const formattedService = service
				.replace(/([A-Z])/g, " $1")
				.replace(/^./, (str) => str.toUpperCase());
			return `• ${formattedService}`;
		})
		.join("\n");

	return `
NEW QUOTE REQUEST

CONTACT INFORMATION:
-------------------
Full Name: ${formData.fullName}
Phone: ${formData.phone}
Email: ${formData.email}
Preferred Contact: ${formData.preferredContact}

VEHICLE INFORMATION:
-------------------
Year: ${formData.year}
Make: ${formData.make}
Model: ${formData.model}
Vehicle Type: ${formData.vehicleType}

SERVICES REQUESTED:
------------------
${servicesList || "No services selected"}

SERVICE PREFERENCES:
-------------------
Tint Shade: ${formData.tintShade}
Timing: ${formData.timing}
Budget: ${formData.budget}

ADDITIONAL INFORMATION:
----------------------
${formData.additionalInfo || "No additional information provided"}

---
This email was sent from your website contact form.
  `;
};

// API endpoint
router.post("/send-quote-request", async (req, res) => {
	const formData = req.body;

	try {
		// Validate required fields
		if (!formData.fullName || !formData.phone || !formData.email) {
			return res.status(400).json({
				success: false,
				message: "Please fill in all required fields: name, phone, and email",
			});
		}

		const mailOptions = {
			from: process.env.EMAIL_USER || "abbasbahi289@gmail.com",
			to: "Thedallastintshop@gmail.com",
			subject: `New Quote Request from ${formData.fullName}`,
			text: createEmailTemplate(formData),
			html: createEmailHTMLTemplate(formData),
		};

		await transporter.sendMail(mailOptions);

		res.json({
			success: true,
			message: "Quote request sent successfully!",
		});
	} catch (error) {
		console.error("Error sending email:", error);
		res.status(500).json({
			success: false,
			message: "Failed to send quote request. Please try again.",
		});
	}
});

// HTML email template
const createEmailHTMLTemplate = (formData) => {
	const servicesList = Object.entries(formData.services)
		.filter(([service, selected]) => selected)
		.map(([service]) => {
			const formattedService = service
				.replace(/([A-Z])/g, " $1")
				.replace(/^./, (str) => str.toUpperCase());
			return `<li>${formattedService}</li>`;
		})
		.join("");

	return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
    .section { margin: 20px 0; padding: 15px; border-left: 4px solid #007bff; background: #f9f9f9; }
    .label { font-weight: bold; color: #555; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Quote Request</h1>
      <p>From your website contact form</p>
    </div>

    <div class="section">
      <h2>Contact Information</h2>
      <p><span class="label">Full Name:</span> ${formData.fullName}</p>
      <p><span class="label">Phone:</span> ${formData.phone}</p>
      <p><span class="label">Email:</span> ${formData.email}</p>
      <p><span class="label">Preferred Contact:</span> ${
				formData.preferredContact
			}</p>
    </div>

    <div class="section">
      <h2>Vehicle Information</h2>
      <p><span class="label">Year:</span> ${formData.year}</p>
      <p><span class="label">Make:</span> ${formData.make}</p>
      <p><span class="label">Model:</span> ${formData.model}</p>
      <p><span class="label">Vehicle Type:</span> ${formData.vehicleType}</p>
    </div>

    <div class="section">
      <h2>Services Requested</h2>
      ${
				servicesList
					? `<ul>${servicesList}</ul>`
					: "<p>No services selected</p>"
			}
    </div>

    <div class="section">
      <h2>Service Preferences</h2>
      <p><span class="label">Tint Shade:</span> ${formData.tintShade}</p>
      <p><span class="label">Timing:</span> ${formData.timing}</p>
      <p><span class="label">Budget:</span> ${formData.budget}</p>
    </div>

    ${
			formData.additionalInfo
				? `
    <div class="section">
      <h2>Additional Information</h2>
      <p>${formData.additionalInfo}</p>
    </div>
    `
				: ""
		}
  </div>
</body>
</html>
  `;
};

module.exports = router;
