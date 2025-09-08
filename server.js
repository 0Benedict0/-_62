import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pug from "pug";
import ejs from "ejs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const SECRET = "supersecretkey"; 


app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.set("views", path.join(__dirname, "views"));
app.engine("pug", pug.__express);
app.engine("ejs", ejs.__express);


const users = [
  { id: 1, name: "Alice", email: "alice@mail.com", password: "123" },
  { id: 2, name: "Bob", email: "bob@mail.com", password: "456" },
];

const articles = [
  { id: 1, title: "Express Basics", content: "Express — это веб-фреймворк для Node.js" },
  { id: 2, title: "Pug vs EJS", content: "Pug и EJS — это шаблонизаторы для Express" },
];

app.get("/set-theme/:theme", (req, res) => {
  const { theme } = req.params;
  res.cookie("theme", theme, { maxAge: 1000 * 60 * 60 * 24 });
  res.send(`Theme set to ${theme}. <a href="/">Go back</a>`);
});


app.use((req, res, next) => {
  res.locals.theme = req.cookies.theme || "light";
  next();
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });

  res.cookie("token", token, { httpOnly: true });
  res.json({ message: "Logged in successfully" });
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const id = users.length + 1;
  users.push({ id, name, email, password });
  res.json({ message: "User registered" });
});


function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(403).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}


app.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.email}` });
});


app.get("/users", (req, res) => {
  res.render("pug/users", { users, title: "User List" });
});

app.get("/users/:userId", (req, res) => {
  const user = users.find(u => u.id == req.params.userId);
  if (!user) return res.status(404).send("User not found");
  res.render("pug/user", { user, title: "User Details" });
});


app.get("/articles", (req, res) => {
  res.render("ejs/articles.ejs", { articles, title: "Articles List" });
});

app.get("/articles/:articleId", (req, res) => {
  const article = articles.find(a => a.id == req.params.articleId);
  if (!article) return res.status(404).send("Article not found");
  res.render("ejs/article.ejs", { article, title: "Article Details" });
});

app.use((req, res, next) => {
  res.locals.theme = req.cookies.theme || "light";
  next();
});


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});