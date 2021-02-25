require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async (done) => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app).post('/auth/signup').send({
        email: 'jon@user.com',
        password: '1234',
      });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll((done) => {
      return client.end(done);
    });

    test('returns data', async () => {
      const expectation = [
        {
          category_id: 1,
          name: '3700x',
          cores: 8,
          integrated_gpu: false,
          tdp: 65,
          family: 'Ryzen',
          id: 1,
          owner_id: 1,
        },
        {
          category_id: 1,
          name: '3600',
          cores: 6,
          integrated_gpu: false,
          tdp: 65,
          family: 'Ryzen',
          id: 2,
          owner_id: 1,
        },
        {
          category_id: 2,
          name: '3000g',
          cores: 2,
          integrated_gpu: true,
          tdp: 35,
          family: 'Athlon',
          id: 3,
          owner_id: 1,
        },
        {
          category_id: 1,
          name: '3900x',
          cores: 12,
          integrated_gpu: false,
          tdp: 105,
          family: 'Ryzen',
          id: 4,
          owner_id: 1,
        },
        {
          category_id: 1,
          name: '3200g',
          cores: 4,
          integrated_gpu: true,
          tdp: 65,
          family: 'Ryzen',
          id: 5,
          owner_id: 1,
        },
      ];

      const data = await fakeRequest(app)
        .get('/cpuData')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns the first data item', async () => {
      const expectation = [
        {
          category_id: 1,
          name: '3700x',
          cores: 8,
          integrated_gpu: false,
          tdp: 65,
          family: 'Ryzen',
          id: 1,
          owner_id: 1,
        },
      ];

      const data = await fakeRequest(app)
        .get('/cpuData/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('add a new cpu', async () => {
      const newCpu = {
        category_id: 1,
        name: '3950x',
        cores: 16,
        integrated_gpu: false,
        tdp: 105,
        family: 'Ryzen',
      };

      const expectedCpu = {
        category_id: 1,
        name: '3950x',
        cores: 16,
        integrated_gpu: false,
        tdp: 105,
        family: 'Ryzen',
        id: 6,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .post('/cpuData')
        .send(newCpu)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(expectedCpu);
    });

    test('deletes the first data item', async () => {
      const expectation = {
        category_id: 1,
        name: '3700x',
        cores: 8,
        integrated_gpu: false,
        tdp: 65,
        family: 'Ryzen',
        id: 1,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .delete('/cpuData/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    
      const nothing = await fakeRequest(app)
        .get('/cpuData/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual([]);

    });

    test('UPDATES a cpu', async () => {
      const newCpu =
        {
          category_id: 1,
          name: '3700x',
          cores: 16,
          integrated_gpu: false,
          tdp: 105,
          family: 'Ryzen',
        };

      const expectedCpu = {
        ...newCpu,
        owner_id: 1,
        id: 2,
      };

      await fakeRequest(app)
        .put('/cpuData/2')
        .send(newCpu)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedCpu = await fakeRequest(app)
        .get('/cpuData/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updatedCpu.body[0]).toEqual(expectedCpu);
    });
  });
});
