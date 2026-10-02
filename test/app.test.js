const request = require('supertest');
const app = require('../src/app');

describe('DevOps API Endpoint Verification Tests', () => {
    
    it('should return 200 OK and welcome message for root path', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('success');
        expect(res.body).toHaveProperty('message');
    });

    it('should return 200 OK and status UP for health endpoint', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('UP');
    });
});
