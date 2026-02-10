require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const OFFICIAL_EMAIL = "rivanshi0948.be23@chitkara.edu.in";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const fibonacci = (n) => {
  if (n <= 0) return [];
  if (n === 1) return [0];

  const arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr;
};

const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
};

const lcmTwo = (a, b) => Math.abs(a * b) / gcd(a, b);

const lcmArray = (arr) => arr.reduce((a, b) => lcmTwo(a, b));

const hcfArray = (arr) => arr.reduce((a, b) => gcd(a, b));



 const askAI = async (question) => {
  try {
    const result = await model.generateContent(
      question + "\nAnswer in exactly one single word."
    );

    let text = result.response.text().trim();

    text = text.replace(/\*\*/g, "");
    text = text.replace(/[^\w\s]/g, "").trim();

  
    const words = text.split(/\s+/);

    
    return words[words.length - 1];

  } catch (e) {
    console.error("AI Error:", e);
    return "Error";
  }
};



app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({ is_success: false });
    }

    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({ is_success: false });
    }

    const key = keys[0];
    const value = body[key];

    let result;

    switch (key) {

      case "fibonacci":
        if (typeof value !== "number" || value < 0) {
          return res.status(400).json({ is_success: false });
        }
        result = fibonacci(value);
        break;

      case "prime":
        if (!Array.isArray(value)) {
          return res.status(400).json({ is_success: false });
        }
        result = value.filter(v => Number.isInteger(v) && isPrime(v));
        break;

      case "lcm":
        if (!Array.isArray(value) || value.length === 0) {
          return res.status(400).json({ is_success: false });
        }
        if (!value.every(v => typeof v === "number")) {
          return res.status(400).json({ is_success: false });
        }
        result = lcmArray(value);
        break;

      case "hcf":
        if (!Array.isArray(value) || value.length === 0) {
          return res.status(400).json({ is_success: false });
        }
        if (!value.every(v => typeof v === "number")) {
          return res.status(400).json({ is_success: false });
        }
        result = hcfArray(value);
        break;

      case "AI":
        if (typeof value !== "string" || value.trim() === "") {
          return res.status(400).json({ is_success: false });
        }
        result = await askAI(value);
        break;

      default:
        return res.status(400).json({ is_success: false });
    }

    return res.json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data: result
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ is_success: false });
  }
});

app.get("/health", (req, res) => {
  res.json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
