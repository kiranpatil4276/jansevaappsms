// server.js

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { start } = require("repl");

const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Keep your Fast2SMS API Key safe (ideally store in .env file)
const FAST2SMS_API_KEY = "HJi8wSaCrPVSMYLmNHvKnOFDAr17nUA2u59bmRzNnuaoAyRnQcUHGPruUFXp";

// Root route (optional)
app.get("/", (req, res) => {
  res.send("🚀 SMS API is running! Use POST /send-sms");
});

// POST endpoint to send SMS
app.post("/send-sms", async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({
      success: false,
      message: "Mobile number and message are required",
    });
  }

  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        sender_id: "FSTSMS",
        message,
        language: "english",
        route: "q", // 'q' is for transactional SMS
        numbers: number,
      },
      {
        headers: {
          authorization: FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // Check Fast2SMS response
    if (response.data.return === true) {
      return res.json({ success: true, message: "✅ SMS sent successfully!" });
    } else {
      return res.json({
        success: false,
        message: "⚠️ SMS sending failed",
        details: response.data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error sending SMS",
      error: error.response?.data || error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ SMS API Server running at http://localhost:${PORT}`);
});


//run project
// npm init

// npm start