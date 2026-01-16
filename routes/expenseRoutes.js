const express = require("express");
const pool = require("../config/db");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* ➕ ADD EXPENSE ✅ FIXED */
router.post("/", protect, async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category, date, user_id)
       VALUES ($1,$2,$3,NOW(),$4)
       RETURNING *`,
      [title, amount, category, req.user]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 📄 GET EXPENSES */
router.get("/", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM expenses
       WHERE user_id = $1
       ORDER BY date DESC`,
      [req.user]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ❌ DELETE EXPENSE */
router.delete("/:id", protect, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user]
    );

    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ✅ SUMMARY ✅ FIXED */
router.get("/summary", protect, async (req, res) => {
  try {
    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(amount),0) as total 
       FROM expenses 
       WHERE user_id = $1 
       AND date_trunc('month', COALESCE(date, now())) = date_trunc('month', CURRENT_DATE)`,
      [req.user]
    );

    const userResult = await pool.query(
      "SELECT monthly_limit FROM users WHERE id = $1",
      [req.user]
    );

    res.json({
      total: totalResult.rows[0].total,
      limit: userResult.rows[0].monthly_limit
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ✅ CATEGORY CHART (current month)
router.get("/chart", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT category, COALESCE(SUM(amount),0) as total
       FROM expenses
       WHERE user_id = $1
       AND date_trunc('month', COALESCE(date, now())) = date_trunc('month', CURRENT_DATE)
       GROUP BY category
       ORDER BY total DESC`,
      [req.user]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
