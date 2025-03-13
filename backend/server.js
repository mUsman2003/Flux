const express = require("express");
const app = express();

// Middleware to parse JSON
app.use(express.json());

// 🏠 Home Route
app.get("/", (req, res) => {
    res.send("Welcome to My Express App!");
});

// 📌 About Route
app.get("/about", (req, res) => {
    res.send("This is the About Page.");
});

// 🔐 Login Route (POST Request)
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    res.json({ message: "Login successful", username });
});

// 🛠 Services Route
app.get("/services", (req, res) => {
    res.json([
        { id: 1, name: "Web Development" },
        { id: 2, name: "App Development" },
        { id: 3, name: "SEO Optimization" }
    ]);
});

app.patch("/user/:username", (req, res) => {
    const { username } = req.params;
    const updates = req.body;

    if (!updates.email && !updates.age) {
        return res.status(400).json({ error: "At least one field (email or age) is required" });
    }

    res.json({ message: "User updated successfully", username, updates });
});

app.put("/user/:username", (req, res) => {
    const { username } = req.params;
    const { email, age } = req.body;

    
    if (!email || !age) {
        return res.status(400).json({ error: "Email and age are required" });
    }

    res.json({ message: "User updated successfully", user: { username, email, age } });
});


// ❓ 404 Route (For unknown paths)
app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
});

// 🚀 Start Server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
