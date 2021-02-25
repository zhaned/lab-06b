const client = require('../lib/client');
// import our seed data:
const cpuData = require('./cpuData.js');
const usersData = require('./users.js');
const categoriesData = require('./categories.js');
const { getEmoji } = require('../lib/emoji.js');
const { getCategoryId } = require('../data/dataUtils.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );

    const placeholder = await Promise.all(
      categoriesData.map(category => {
        return client.query(`
                      INSERT INTO categories (name)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [category.name]);
      })
    );

    const user = users[0].rows[0];

    const categories = placeholder.map(({ rows }) => rows[0]);

    await Promise.all(
      cpuData.map(cpuData => {
        const categoryId = getCategoryId(cpuData, categories);
        return client.query(`
                    INSERT INTO cpuData (category_id, name, cores, integrated_gpu, tdp, family, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [
          categoryId, 
          cpuData.name, 
          cpuData.cores, 
          cpuData.integrated_gpu, 
          cpuData.tdp, 
          cpuData.family, 
          user.id
        ]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
