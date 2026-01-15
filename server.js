require("dotenv").config();
console.log("🔥 THIS SERVER FILE IS RUNNING");

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "sms_secret_key";

// ===============================
// In-memory user storage
// ===============================
const users = [];

// ===============================
// REGISTER
// ===============================
app.post("/api/register", (req, res) => {
    const { username, password, role, child } = req.body;

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "User already exists" });
    }

    const user = { username, password, role };

    if (role === "student") {
        user.marks = { math: null, science: null, english: null };
    }

    if (role === "parent") {
        user.child = child;
    }

    users.push(user);
    res.json({ success: true });
});

// ===============================
// LOGIN
// ===============================
app.post("/api/login", (req, res) => {
    const { username, password, role } = req.body;

    const user = users.find(
        u => u.username === username && u.password === password && u.role === role
    );

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { username: user.username, role: user.role },
        SECRET_KEY,
        { expiresIn: "1h" }
    );

    res.json({ success: true, token, role });
});

// ===============================
// GET LOGGED USER
// ===============================
app.get("/api/me", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) 
        return res.status(401).json({ 
    message: "Token missing" 
});

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json(users.find(u => u.username === decoded.username));
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
});
// FACULTY UPDATE STUDENT MARKS 
app.post("/api/marks", (req, res) => { 
    const { studentUsername, subject, marks } = req.body; 
    const student = users.find( u => u.username === studentUsername && u.role === "student" );
     if (!student) { 
        return res.status(404).json({ message: "Student not found" }); 
    } if (!student.marks.hasOwnProperty(subject)) { 
        return res.status(400).json({ message: "Invalid subject" });
     } 
     student.marks[subject] = marks; 
     res.json({ success: true, message: "Marks updated successfully" }); });
      // GET PARENT'S CHILD DETAILS 
app.get("/api/child", (req, res) => { 
    const authHeader = req.headers.authorization; 
    if (!authHeader) { return res.status(401).json({ message: "Token missing" }); 
} const token = authHeader.split(" ")[1]; try { const decoded = jwt.verify(token, SECRET_KEY); const parent = users.find( u => u.username === decoded.username && u.role === "parent" ); if (!parent || !parent.child) { return res.status(404).json({ message: "Child not linked" }); } const child = users.find( u => u.username === parent.child && u.role === "student" ); if (!child) { return res.status(404).json({ message: "Child not found" }); } res.json(child); } catch { res.status(401).json({ message: "Invalid token" }); } });
// ===============================
// AI CHATBOT API (GROQ ✅ FINAL)
// ===============================
app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ reply: "Message required" });
    }

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant", // ✅ FIXED MODEL
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful AI assistant for a student management system."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!data.choices || !data.choices.length) {
            console.error("Groq raw response:", data);
            return res.status(500).json({
                reply: "AI failed to respond. Try again."
            });
        }

        res.json({
            reply: data.choices[0].message.content
        });

    } catch (err) {
        console.error("Groq error:", err);
        res.status(500).json({ reply: "AI service unavailable" });
    }
});
// ===============================
// FORGOT PASSWORD - GENERATE OTP
// ===============================
app.post("/api/forgot-password", (req, res) => {
    const { username } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    console.log(`🔐 OTP for ${username}:`, otp);

    res.json({
        success: true,
        message: "OTP generated (demo purpose)",
        otp // ⚠️ demo only
    });
});
// ===============================
// RESET PASSWORD USING OTP
// ===============================
app.post("/api/reset-password", (req, res) => {
    const { username, otp, newPassword } = req.body;

    const user = users.find(u => u.username === username);
    if (!user || !user.resetOTP) {
        return res.status(400).json({ message: "Invalid request" });
    }

    if (user.resetOTP !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.resetExpiry) {
        return res.status(400).json({ message: "OTP expired" });
    }

    user.password = newPassword;
    delete user.resetOTP;
    delete user.resetExpiry;

    res.json({
        success: true,
        message: "Password reset successful"
    });
});
// ===============================
// ADMIN: GET ALL USERS
// ===============================
app.get("/api/users", (req, res) => {
    const safeUsers = users.map(u => ({
        username: u.username,
        role: u.role
    }));

    res.json(safeUsers);
});

// ===============================
// SERVER START
// ===============================
app.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
});
