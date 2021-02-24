const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/cpuData', async(req, res) => {
  try {
    const data = await client.query('SELECT * from cpuData');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/cpuData/:id', async(req, res) => {
  try {
    const dataId = req.params.id;
    const data = await client.query('SELECT * from cpuData where id=$1', [dataId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/cpuData/:id', async(req, res) => {
  try {
    const dataId = req.params.id;
    const data = await client.query('delete from cpuData where id=$1', [dataId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/cpuData', async(req, res) => {
  try {

    const data = await client.query(`
    INSERT INTO cpuData(category_id, name, cores, integrated_gpu, tdp, family, owner_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `, 
    [
      req.body.category_id, 
      req.body.name, 
      req.body.cores, 
      req.body.integrated_gpu, 
      req.body.tdp, 
      req.body.family,
      1
    ]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.put('/cpuData/:id', async(req, res) => {
  const dataId = req.params.id;

  try {
    const data = await client.query(`
      UPDATE cpuData
      SET category_id = $1, name = $2, cores = $3, integrated_gpu = $4, tdp = $5, family = $6
      WHERE cpuData.id = $7
      RETURNING *
    `, 
    [
      req.body.category_id, 
      req.body.name, 
      req.body.cores, 
      req.body.integrated_gpu, 
      req.body.tdp, 
      req.body.family,
      dataId,
    ]);
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
