let express = require('express');
let morgan = require('morgan');

let app = express();
let port = 3000;

// Middlewares
app.use(morgan('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => { console.log('App running on port', port); });

let { Pool } = require('pg');
let pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'api',
  user: 'boruch',
  password: 'boruch',
});


// -------- Routes ------------------------
app.get('/', (request, response) => {
  response.send('Hello from the app');
});

app.get('/users', function (request, response) {
  pool.query('select * from users order by id asc', (error, results) => {
    if (error) {
      throw error;
    }

    response.status(200).json(results.rows);
  });
});

app.get('/users/:id', (request, response) => {
  let id = parseInt(request.params.id);

  pool.query(`select * from users where id = ${id}`, (error, results) => {
    if (error) throw error;

    response.status(200).json(results.rows);
  });
});

app.post('/users', (request, response) => {
  let { name, email } = request.body;

  pool.query('insert into users (name, email) values ($1, $2) returning *', [name, email], (error, results) => {
    if (error) console.log(error);

    response.status(201).json(results.rows);
  });
});

app.put('/users/:id', (request, response) => {

  let id = request.params.id;
  let { name, email } = request.body;

  pool.query('update users set name = $1, email = $2 where id = $3 returning *;', [name, email, id], (error, results) => {
    response.status(200).send('Update successful');
  });
});

app.delete('/users/:id', (request, response) => {
  let id = request.params.id;

  pool.query('delete from users where id = $1', [id], (error, result) => {
    response.status(200).send('User deleted');
  })
});
