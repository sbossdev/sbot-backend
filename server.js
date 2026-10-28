const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "openai/gpt-oss-120b";

app.get("/", (req, res) => {
  res.send("S-BOT Backend is running!");
});

app.post("/chat", async (req, res) => {
  try {
    const { messages, thinkHarder } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const systemPrompt = thinkHarder
      ? "You are S-BOT, made by SBOSS. Think carefully step-by-step and give a deeper, more detailed answer."
      : "You are S-BOT, an AI assistant created by SBOSS. Be helpful, clear and natural.";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: thinkHarder ? 0.3 : 0.7,
        max_tokens: 1400
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong on the server" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("S-BOT Backend running on port " + PORT);
});
