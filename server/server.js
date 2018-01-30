// server.js

// set up ======================================================================
// get all the tools we need
import config from 'config'
import express from 'express';
import database from './Database'
import bodyParser from 'body-parser'


const app = express();
const port = process.env.PORT || 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.get('/products', (req,res) => {
  database.query( 'SELECT * FROM produkte' )
  .then( rows => {
    return res.send(rows);
  })
  .catch(err => console.log(err));
});

app.get('/products/:id', (req,res) => {
  const id = req.params.id;

  database.query( `
    SELECT *
    FROM
    produkte
    where produkt_id = ${id}`
  )
  .then( rows => {
    return res.send(rows);
  })
  .catch(err => console.log(err));;
})

app.post('/products', (req,res) => {
  const { produktname, preis, onlinestatus_id } = req.body;

  database.query( `
    INSERT INTO
    produkte
    VALUES(
      NULL,
      "${produktname}",
      ${preis},
      ${onlinestatus_id}
    )`
  )
  .then( rows => {
    return res.send(rows);
  })
  .catch(err => console.log(err));
})

app.put('/products/:id', (req,res) => {
  const id = req.params.id;
  const { produktname, preis, onlinestatus_id } = req.body;

  database.query( `
    UPDATE produkte
    SET
    produktname='${produktname}',
    preis=${preis},
    onlinestatus_id='${onlinestatus_id}'
    WHERE produkt_id=${id}`
  )
  .then( rows => {
    return res.send(rows);
  })
  .catch(err => console.log(err));
})


// launch ======================================================================
app.listen(port);
console.log(`The magic happens on port ${port}`);
