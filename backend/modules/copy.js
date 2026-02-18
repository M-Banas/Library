//copy------------------------------------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const client = require('./baza');
const { authenticateAdmin } = require('./jwt');


router.post('/copy/add',authenticateAdmin, async (req, res) => {
    let results="";
    for(let i=0;i<req.body.count;i++){
    const result = await client.query('INSERT INTO copy (book_id) VALUES ($1) RETURNING *', [req.body.id]);
    results+=result;
    }
    res.json(results);
});

router.get('/copy/by-book/:book_id',authenticateAdmin, async (req, res) => {
    const bookId = req.params.book_id;
    const result = await client.query(
        `SELECT c.*, 
            CASE WHEN b.copy_id IS NOT NULL THEN true ELSE false END AS is_borrowed
         FROM copy c
         LEFT JOIN borrowed b ON c.id = b.copy_id
         WHERE c.book_id = $1`,
        [bookId]
    );
    res.json(result.rows);
});

router.delete('/copy/delete/:id', authenticateAdmin, async (req, res) => {
    const copyId = req.params.id;
    const check = await client.query(
        'SELECT 1 FROM borrowed WHERE copy_id = $1 AND return_date IS NULL',
        [copyId]
    );
    if (check.rowCount > 0) {
        return res.status(400).json({ error: 'Nie można usunąć kopii, ponieważ jest aktualnie wypożyczona.' });
    }
    await client.query('DELETE FROM borrowed WHERE copy_id = $1', [copyId]);
    await client.query('DELETE FROM copy WHERE id = $1', [copyId]);
    res.send({ deleted: true, copy_id: copyId });
});

module.exports = router;
