import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        "https://storied-fox-306a29.netlify.app",
        "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
}));

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

app.post("/api/ai", async (req, res) => {
  try {
    const { prompt, transactions, balance, income, expenses, settings } =
      req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        error: "Prompt is required.",
      });
    }

    const financeContext = `
You are a smart AI Financial Assistant integrated into a Personal Finance Tracker.

Your job is to help the user understand their finances.

Guidelines:

- Answer finance-related questions naturally.
- Use the user's transaction data whenever possible.
- Keep answers short and useful.
- If calculations are needed, calculate them from the provided data.
- If the user asks something unrelated to finance, politely answer that you are mainly designed to help with finance and budgeting.
- Do not invent transactions that are not provided.
- If there is insufficient information, clearly state that.

Current Financial Information

Currency:
${settings?.currency ?? "₹"}

Budget:
${settings?.budget ?? 0}

Current Balance:
${balance}

Total Income:
${income}

Total Expenses:
${expenses}

Transactions:
${JSON.stringify(transactions, null, 2)}

User Question:
${prompt}
`;

    const result = await model.generateContent(financeContext);

    const response = result.response.text();

    res.json({
      text: response,
    });
  } catch (error) {
    console.error("Gemini Error:");
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Finance Tracker running at http://localhost:${PORT}`);
});
