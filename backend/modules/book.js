//book------------------------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const client = require('./baza');
const { authenticateAdmin } = require('./jwt');


router.post('/book/add', authenticateAdmin, async (req, res) => {
    const { title, author, genre, description } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO book (title, author, genre, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, author, genre, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/book/delete/:id', authenticateAdmin, async (req, res) => {
    const bookId = req.params.id;
    const check = await client.query(
        `SELECT 1 FROM copy c JOIN borrowed b ON c.id = b.copy_id WHERE c.book_id = $1 AND b.return_date IS NULL`,
        [bookId]
    );
    if (check.rowCount > 0) {
        return res.status(400).json({ error: 'Nie można usunąć książki, ponieważ przynajmniej jedna kopia jest aktualnie wypożyczona.' });
    }
    await client.query('DELETE FROM copy WHERE book_id = $1', [bookId]);
    await client.query('DELETE FROM book WHERE id = $1', [bookId]);
    res.send({ deleted: true, book_id: bookId });
});

router.get('/book/list', async (req, res) => {
    const result = await client.query(`
    SELECT
    b.*,
    COUNT(c.id) AS copies,
    (
        SELECT COUNT(*)
        FROM copy c2
        WHERE c2.book_id = b.id
          AND NOT EXISTS (
              SELECT 1
              FROM borrowed br2
              WHERE br2.copy_id = c2.id
                AND br2.return_date IS NULL
          )
    ) > 0 AS is_available
    FROM book b
    LEFT JOIN copy c ON b.id = c.book_id
    GROUP BY b.id
    ORDER BY b.title;
    `);
    res.json(result.rows);
});



router.get('/book/:id', async (req, res) => {
    const result = await client.query('SELECT * FROM book WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
});

router.post('/book/update/:id', authenticateAdmin, async (req, res) => {
    const { title, author, genre, description } = req.body;
    await client.query(
        'UPDATE book SET title = $1, author = $2, genre = $3, description = $4 WHERE id = $5',
        [title, author, genre, description, req.params.id]
    );
    res.send({ updated: true });
});

router.get('/book/details/:id', async (req, res) => {
    const bookId = req.params.id;
    try {
        const bookResult = await client.query('SELECT * FROM book WHERE id = $1', [bookId]);
        const book = bookResult.rows[0];
        if (!book) return res.status(404).json({ error: 'Book not found' });

        const availableResult = await client.query(`
           SELECT COUNT(*) AS available_copies
            FROM copy c
            WHERE c.book_id = $1
            AND NOT EXISTS (
            SELECT 1
            FROM borrowed b
            WHERE b.copy_id = c.id
            AND b.return_date IS NULL)
        `, [bookId]);
        const available_copies = parseInt(availableResult.rows[0].available_copies);

        const nextReturnResult = await client.query(`
            SELECT
            CASE
            WHEN EXISTS (
                SELECT 1
                FROM copy c
                WHERE c.book_id = $1
                    AND NOT EXISTS (
                    SELECT 1
                    FROM borrowed b
                    WHERE b.copy_id = c.id
                        AND b.return_date IS NULL
                    )
                )
                THEN NULL
                ELSE (
                SELECT MIN(b.expected_return_date)
                FROM copy c
                JOIN borrowed b ON b.copy_id = c.id
                WHERE c.book_id = $1
                    AND b.return_date IS NULL
                )
            END AS next_available_date;

        `, [bookId]);
        const next_available_date = nextReturnResult.rows[0].next_available_date;

        res.json({
            ...book,
            available_copies,
            next_available_date
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/book/authors/list', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT DISTINCT author 
            FROM book 
            WHERE author IS NOT NULL 
            ORDER BY author
        `);
        res.json(result.rows.map(row => row.author));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/book/genres/list', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT DISTINCT genre 
            FROM book 
            WHERE genre IS NOT NULL 
            ORDER BY genre
        `);
        res.json(result.rows.map(row => row.genre));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
