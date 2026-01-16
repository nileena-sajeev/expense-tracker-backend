require("dotenv").config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const express = require("express");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));

// Test DB connection
const pool = require("./config/db");

pool.query("select 1")
  .then(() => {
    console.log("✅ Supabase PostgreSQL connected");
  })
  .catch(err => {
    console.error("❌ DB error FULL:", err);
  });


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
