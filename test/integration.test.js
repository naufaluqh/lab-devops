const request = require('supertest');
const app = require('../src/app');
const { pool } = app;

describe('DevOps API Integration Tests (real PostgreSQL)', () => {

    beforeAll(async () => {
        // The root route creates the table if it does not exist yet
        await request(app).get('/');
    });

    afterAll(async () => {
        await pool.end(); // close DB connections so Jest can exit cleanly
    });

    it('should persist submitted data and show it on the page', async () => {
        const marker = `integration-${Date.now()}`;

        const post = await request(app)
            .post('/add-data')
            .type('form')
            .send({ logContent: marker });
        expect(post.statusCode).toEqual(302); // redirect back to '/'

        const page = await request(app).get('/');
        expect(page.statusCode).toEqual(200);
        expect(page.text).toContain(marker);
    });

    it('should store malicious input safely and render it escaped', async () => {
        await request(app)
            .post('/add-data')
            .type('form')
            .send({ logContent: '<script>alert(1)</script>' });

        const page = await request(app).get('/');
        expect(page.text).not.toContain('<script>alert(1)</script>');
        expect(page.text).toContain('&lt;script&gt;');
    });
});
