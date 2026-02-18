//borrowed table------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const client = require('./baza');
const { authenticateUser } = require('./jwt');

router.post('/borrow', authenticateUser, async (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.id;
    try {
        const copy_id = await client.query(
            'Select Max(id) as id from copy where book_id=$1 and id not in (select copy_id from borrowed where return_date is null) ',
            [book_id]
        );
        const result = await client.query(
            'INSERT INTO borrowed (user_id,copy_id) VALUES ($1, $2) RETURNING *',
            [user_id, copy_id.rows[0].id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/borrow', authenticateUser, async (req, res) => {
    const user_id = req.user.id;
    const result = await client.query(`
        SELECT b.*, c.book_id, bk.title, bk.author
        FROM borrowed b
        JOIN copy c ON b.copy_id = c.id
        JOIN book bk ON c.book_id = bk.id
        WHERE b.user_id = $1
    `, [user_id]);
    res.json(result.rows);
});

router.get('/borrow/return/:id', authenticateUser, async (req, res) => {
    const user_id = req.user.id;
    const check = await client.query(
        `SELECT * FROM borrowed WHERE id = $1 AND user_id = $2 AND return_date IS NULL`,
        [req.params.id, user_id]
    );
    if (check.rowCount === 0) {
        return res.status(404).json({ error: 'No borrowed record found for this id and user.' });
    }
    const result = await client.query(
        `UPDATE borrowed SET return_date = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [req.params.id]
    );
    res.json(result.rows[0]);
});


module.exports = router;