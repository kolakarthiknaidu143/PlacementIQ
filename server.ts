import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("placement_iq.db");
const JWT_SECRET = process.env.JWT_SECRET || "placement-iq-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    level TEXT NOT NULL, -- Beginner, Intermediate, Advanced
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    technologies TEXT NOT NULL,
    status TEXT NOT NULL, -- Completed, In Progress
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS mock_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    test_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
      const result = stmt.run(name, email, hashedPassword);
      const token = jwt.sign({ id: result.lastInsertRowid, email, name }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ id: result.lastInsertRowid, name, email });
    } catch (e: any) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ id: user.id, name: user.name, email: user.email });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  // --- Skills Routes ---
  app.get("/api/skills", authenticateToken, (req: any, res) => {
    const skills = db.prepare("SELECT * FROM skills WHERE user_id = ?").all(req.user.id);
    res.json(skills);
  });

  app.post("/api/skills", authenticateToken, (req: any, res) => {
    const { name, level } = req.body;
    const stmt = db.prepare("INSERT INTO skills (user_id, name, level) VALUES (?, ?, ?)");
    const result = stmt.run(req.user.id, name, level);
    res.json({ id: result.lastInsertRowid, name, level });
  });

  app.delete("/api/skills/:id", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM skills WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // --- Projects Routes ---
  app.get("/api/projects", authenticateToken, (req: any, res) => {
    const projects = db.prepare("SELECT * FROM projects WHERE user_id = ?").all(req.user.id);
    res.json(projects);
  });

  app.post("/api/projects", authenticateToken, (req: any, res) => {
    const { title, technologies, status } = req.body;
    const stmt = db.prepare("INSERT INTO projects (user_id, title, technologies, status) VALUES (?, ?, ?, ?)");
    const result = stmt.run(req.user.id, title, technologies, status);
    res.json({ id: result.lastInsertRowid, title, technologies, status });
  });

  app.delete("/api/projects/:id", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // --- Mock Tests Routes ---
  app.get("/api/mock-tests", authenticateToken, (req: any, res) => {
    const tests = db.prepare("SELECT * FROM mock_tests WHERE user_id = ? ORDER BY date DESC").all(req.user.id);
    res.json(tests);
  });

  app.post("/api/mock-tests", authenticateToken, (req: any, res) => {
    const { test_name, score, max_score, date } = req.body;
    const stmt = db.prepare("INSERT INTO mock_tests (user_id, test_name, score, max_score, date) VALUES (?, ?, ?, ?, ?)");
    const result = stmt.run(req.user.id, test_name, score, max_score, date);
    res.json({ id: result.lastInsertRowid, test_name, score, max_score, date });
  });

  app.delete("/api/mock-tests/:id", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM mock_tests WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // --- Certifications Routes ---
  app.get("/api/certifications", authenticateToken, (req: any, res) => {
    const certs = db.prepare("SELECT * FROM certifications WHERE user_id = ?").all(req.user.id);
    res.json(certs);
  });

  app.post("/api/certifications", authenticateToken, (req: any, res) => {
    const { name, platform, date } = req.body;
    const stmt = db.prepare("INSERT INTO certifications (user_id, name, platform, date) VALUES (?, ?, ?, ?)");
    const result = stmt.run(req.user.id, name, platform, date);
    res.json({ id: result.lastInsertRowid, name, platform, date });
  });

  app.delete("/api/certifications/:id", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM certifications WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // --- Dashboard Stats ---
  app.get("/api/stats", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    
    const skills = db.prepare("SELECT * FROM skills WHERE user_id = ?").all(userId) as any[];
    const projects = db.prepare("SELECT * FROM projects WHERE user_id = ?").all(userId) as any[];
    const tests = db.prepare("SELECT * FROM mock_tests WHERE user_id = ?").all(userId) as any[];
    const certs = db.prepare("SELECT * FROM certifications WHERE user_id = ?").all(userId) as any[];

    // Readiness Score Logic:
    // Skills: 30% (Max 10 skills for full score)
    // Projects: 25% (Max 5 projects for full score)
    // Mock Tests: 25% (Average percentage of all tests)
    // Certifications: 20% (Max 4 certs for full score)

    const skillScore = Math.min((skills.length / 10) * 30, 30);
    const projectScore = Math.min((projects.length / 5) * 25, 25);
    
    let testScore = 0;
    if (tests.length > 0) {
      const avgPercent = tests.reduce((acc, t) => acc + (t.score / t.max_score), 0) / tests.length;
      testScore = avgPercent * 25;
    }

    const certScore = Math.min((certs.length / 4) * 20, 20);

    const totalScore = Math.round(skillScore + projectScore + testScore + certScore);

    res.json({
      totalScore,
      breakdown: {
        skills: Math.round(skillScore),
        projects: Math.round(projectScore),
        mockTests: Math.round(testScore),
        certifications: Math.round(certScore)
      },
      counts: {
        skills: skills.length,
        projects: projects.length,
        mockTests: tests.length,
        certifications: certs.length
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
