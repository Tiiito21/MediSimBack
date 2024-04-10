const { Pool } = require('pg');
require('dotenv').config();


const crypto = require('crypto');
const uuid = require('uuid');

let { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, AUTH_SECRET, IV } = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: PGPORT,
});



//Register a new user
const createUser = async ( email, password, type, name) => {
  
  const cypher = crypto.createCipheriv('aes-256-cbc', Buffer.from(AUTH_SECRET, 'hex'), Buffer.from(IV, 'hex'));
  let cryptedPassword = cypher.update(password, 'utf8', 'hex');
  cryptedPassword += cypher.final('hex');

  const id = uuid.v4();
  let client

  try {
    client = await pool.connect();
    console.log("Conexion exitosa")

    await client.query('BEGIN');
    await client.query('INSERT INTO users (userid, email, password, type, name) VALUES ($1, $2, $3, $4, $5)', [id, email, cryptedPassword, type, name]);
    await client.query('COMMIT');
  } catch (error) {
    if(client){
      await client.query('ROLLBACK');
    }
      throw error;
  } finally {
    if(client){
      client.release();
    }
  }
}


//LogIn
const logIn = async (email, password) => {
  let client;
  let decryptedPassword;

  try {
    client = await pool.connect();
    console.log("Conexion exitosa")

    //Solo devuelve lo necesario
    const res = await client.query('SELECT password FROM users WHERE email = $1', [email]);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(AUTH_SECRET, 'hex'), Buffer.from(IV, 'hex'))
    decryptedPassword = decipher.update(res.rows[0].password, 'hex', 'utf8')
    decryptedPassword += decipher.final('utf8')
  } finally {
    if(client){
      client.release();
    }
  }

  if(decryptedPassword && decryptedPassword == password){
    try {
      client = await pool.connect();
      console.log("Conexion exitosa")
  
      //Solo devuelve lo necesario
      const res = await client.query('SELECT userid, email, type, name FROM users WHERE email = $1', [email]);
      if(res.rows.length == 1){
        return res.rows[0];
      }
      else{
        return false;
      }
    } finally {
      if(client){
        client.release();
      }
    }
  }
  else{
    return false;
  }       

  
}

const createClass = async (name, teacher_id) => {
  let client;

  try {
    client = await pool.connect();
    console.log("Conexion exitosa")

    await client.query('BEGIN');
    await client.query('INSERT INTO classes (name, teacher_id) VALUES ($1, $2)', [name, teacher_id]);
    await client.query('COMMIT');
  } catch (error) {
    if(client){
      await client.query('ROLLBACK');
    }
      throw error;
  } finally {
    if(client){
      client.release();
    }
  }
}

//Create a new procedure in the history
const createProcedure = async (procedureName, date, userid, score, errors, time) => {
  let client;

  try {
    client = await pool.connect();
    console.log("Conexion exitosa")

    await client.query('BEGIN');
    await client.query('INSERT INTO procedures (procedureName, date, userid, score, errors, time) VALUES ($1, $2, $3, $4, $5, $6)', [procedureName, date, userid, score, errors, time]);
    await client.query('COMMIT');

    const res = await client.query('SELECT id, userid FROM procedures WHERE procedureName = $1 AND date = $2 AND userid = $3', [procedureName, date, userid]);
    return res.rows[0];
  } catch (error) {
    if(client){
      await client.query('ROLLBACK');
    }
      throw error;
  } finally {
    if(client){
      client.release();
    }
  }
}

//Get all procedures
const getProcedure = async (id) => {

  let client;
  try {
    client = await pool.connect();
    console.log("Conexion exitosa")

    const res = await client.query('SELECT procedurename, date, score, errors, time FROM procedures WHERE id = $1', [id]);
    return res.rows[0];
  } finally {
    if(client){
      client.release();
    }
  }
}


//Get all procedures
const getProcedures = async (userid) => {

  let client;
  try {
    client = await pool.connect();
    console.log("Conexion exitosa")

    const res = await client.query('SELECT id, procedurename, date, score FROM procedures WHERE userid = $1', [userid]);
    return res.rows;
  } finally {
    if(client){
      client.release();
    }
  }
}

//Get all procedures
const getClasses = async (userid) => {

  let client;
  try {
    client = await pool.connect();
    console.log("Conexion exitosa")

    const res = await client.query('SELECT classes.name FROM classes JOIN students_classes ON students_classes.class_id = students_classes.class_id WHERE students_classes.user_id = $1', [userid]);
    return res.rows;
  } finally {
    if(client){
      client.release();
    }
  }
}

//Only checks if user exists when creating a new user
const checkUser = async (email, password) => {
  let client;
  try {
    client = await pool.connect();
    console.log("Conexion exitosa")

    const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows.length > 0;
  } finally {
    if(client){
      client.release();
    }
  }
}

module.exports = { createUser, logIn, createClass, createProcedure, getProcedure, getProcedures, getClasses, checkUser };