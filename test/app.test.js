const request = require('supertest');
const app = require('../src/app');
const { Pool } = require('pg');

// Jest mock block preventing live database dependencies (unit test layer)
jest.mock('pg', () => {
    const mPool = {
        query: jest.fn().mockResolvedValue({
            rows: [
                { id: 1, content: 'Mocked Data 1', created_at: new Date() },
                { id: 2, content: 'Mocked Data 2', created_at: new Date() }
            ]
        })
    };
    return { Pool: jest.fn(() => mPool) };
});

describe('DevOps API Unit Tests (mocked database)', () => {

    it('should return 200 OK and render secure HTML visual interface', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('DevOps Persistence Automation Lab');
        expect(res.text).toContain('CONNECTED TO POSTGRES');
    });

    it('should return 200 OK and status UP for health endpoint', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('UP');
    });

    it('should escape HTML in stored content (XSS protection)', async () => {
        const mPool = new Pool(); // returns the same mocked pool instance
        mPool.query
            .mockResolvedValueOnce({})  // CREATE TABLE
            .mockResolvedValueOnce({    // SELECT
                rows: [{ id: 1, content: '<script>alert(1)</script>', created_at: new Date() }]
            });

        const res = await request(app).get('/');
        expect(res.text).not.toContain('<script>alert(1)</script>');
        expect(res.text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    });
});
