const nodemailer = require('nodemailer');
require('dotenv').config();

// 📩 Contact Me Controller
const contactMe = async (req, res) => {
  const { name, email, message ,brandName } = req.body;
  if (!name || !email || !message  || !brandName) {
    return res.status(400).json({ error: "Please fill in all fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL || "abbasbahi289@gmail.com",
        pass: process.env.ADMIN_PASS || "fgcx thxe pyju xadd", 
      },
    });

    // FIX: Provide a default recipient if TO_EMAIL is not set
    const recipientEmail = process.env.TO_EMAIL || "abbasbahi289@gmail.com";
    
    if (!recipientEmail) {
      return res.status(500).json({ error: "Recipient email not configured" });
    }

    const mailOptions = {
  from: email,
  to: recipientEmail,
  subject: `📧 New Contact Form Submission - ${brandName}`,
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8f9fa;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #00000, #00000);
                padding: 30px;
                text-align: center;
                color: white;
            }
            
            .header h1 {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .header p {
                font-size: 14px;
                opacity: 0.9;
            }
            
            .brand-badge {
                display: inline-block;
                background: rgba(255, 255, 255, 0.2);
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                margin-top: 10px;
            }
            
            .content {
                padding: 40px;
            }
            
            .message-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 24px;
                margin-bottom: 24px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .info-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }
            
            .info-icon {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
                margin-top: 2px;
            }
            
            .info-content h3 {
                font-size: 12px;
                font-weight: 600;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }
            
            .info-content p {
                font-size: 16px;
                color: #1e293b;
                font-weight: 500;
            }
            
            .message-section h3 {
                font-size: 12px;
                font-weight: 600;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 12px;
            }
            
            .message-content {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 16px;
                font-size: 14px;
                line-height: 1.7;
                color: #475569;
            }
            
            .footer {
                background: #f1f5f9;
                padding: 24px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 8px;
            }
            
            .timestamp {
                font-size: 11px;
                color: #94a3b8;
            }
            
            @media (max-width: 480px) {
                .content {
                    padding: 24px;
                }
                
                .header {
                    padding: 24px;
                }
                
                .header h1 {
                    font-size: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <h1>New Contact Form Submission</h1>
                <p>You have received a new message through your website</p>
                <div class="brand-badge">${brandName}</div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <!-- Message Card -->
                <div class="message-card">
                    <div class="info-grid">
                        <!-- Sender Name -->
                        <div class="info-item">
                            <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                            </svg>
                            <div class="info-content">
                                <h3>Sender Name</h3>
                                <p>${name}</p>
                            </div>
                        </div>
                        
                        <!-- Email Address -->
                        <div class="info-item">
                            <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                            </svg>
                            <div class="info-content">
                                <h3>Email Address</h3>
                                <p><a href="mailto:${email}" style="color: #ec4899; text-decoration: none;">${email}</a></p>
                            </div>
                        </div>
                        
                        <!-- Submission Time -->
                        <div class="info-item">
                            <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                            </svg>
                            <div class="info-content">
                                <h3>Submitted At</h3>
                                <p>${new Date().toLocaleString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Message Content -->
                    <div class="message-section">
                        <h3>Message</h3>
                        <div class="message-content">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div style="text-align: center; margin-top: 24px;">
                    <a href="mailto:${email}" style="
                        display: inline-block;
                        background: #ec4899;
                        color: white;
                        padding: 12px 24px;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 500;
                        font-size: 14px;
                        margin: 0 8px;
                    ">Reply to ${name}</a>
                    
                    
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p>This email was automatically generated from your website contact form</p>
                <p class="timestamp">
                    Sent from Monsini Prom • ${new Date().getFullYear()}
                </p>
            </div>
        </div>
    </body>
    </html>
  `,
  // Also include plain text version for email clients that don't support HTML
  text: `
NEW CONTACT FORM SUBMISSION - ${brandName}
=============================================

You have received a new message through your website contact form.

CONTACT DETAILS:
----------------
Name: ${name}
Email: ${email}
Brand: ${brandName}
Submitted: ${new Date().toLocaleString()}

MESSAGE:
--------
${message}

---
This email was automatically generated from your website contact form.
Sent from Monsini Prom • ${new Date().getFullYear()}
  `
};

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to send message: " + error.message });
  }
};

// 🆕 New Subscriber Controller
const newSubscriber = async (req, res) => {
  const { brandName, email } = req.body;

  if (!brandName || !email) {
    return res.status(400).json({ error: "Please provide brand name and email" });
  }

  console.log(req.body)
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL || "abbasbahi289@gmail.com",
        pass: process.env.ADMIN_PASS || "fgcx thxe pyju xadd", 
      },
    });

    // FIX: Provide a default recipient if TO_EMAIL is not set
    const recipientEmail = process.env.TO_EMAIL || "abbasbahi289@gmail.com";
    
    if (!recipientEmail) {
      return res.status(500).json({ error: "Recipient email not configured" });
    }

    const mailOptions = {
      from: process.env.ADMIN_EMAIL || "abbasbahi289@gmail.com",
      to: recipientEmail, // ✅ Now this will always have a value
      subject: `🆕 New Subscriber: ${brandName}`,
      text: `
        A new subscriber has joined your mailing list!
        ----------------------------------------------
        Brand Name: ${brandName}
        Email: ${email}
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Subscription email sent to admin" });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ error: "Failed to send subscription message: " + error.message });
  }
};

module.exports = {
  contactMe,
  newSubscriber
};