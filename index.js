const { createUser, logIn, createClass, createProcedure, getProcedure, getProcedures, getClasses, checkUser } = require('./database');
const { checkEmail } = require('./utils');

require('dotenv').config();

const express = require('express');

var app = express();
app.use(express.json());

var cors = require('cors');
var allowedOrigins = ['http://localhost:4321',
                      'https://medisimvr.netlify.app'];

app.use(cors({
    origin: allowedOrigins
  })
);




app.post('/register', async (req, res) => {
  
    const { email, password, type, name} = req.body;


    //Si falta algun campo se envia un error
    if (!email || !password || !type || !name) {
      res.status(400).send('Falta algun campo');
      return;
    }

    if (!checkEmail(email)) {
     res.status(400).json({ error: 'Correo electrónico no válido' });
     return;
    }


    if (await checkUser(email, password) == false) {
      try {
        const user = await createUser(email, password, type, name);
        res.status(200).send(user);
      } catch (error) {
        console.error('Error creando el usuario:', error);
        res.status(500).send('Error creando el usuario');
      }
    }
    else {
      res.status(409).send('El usuario ya existe');
    }
  }
)

app.post('/login', async (req, res) => {
  
  const { email, password} = req.body;

  try {
    const userData = await logIn(email, password);
    if(userData == false){
      res.status(401).send('Usuario o contraseña incorrectos');
    }else{
      res.status(200).send(userData);
    }
  } catch (error) {
    console.error('Error LogIn:', error);
    res.status(500).send('Error getting data');
  }
})

app.post('/createClass', async (req, res) => {
  const { name, teacher_id } = req.body;
  try {
    const classes = await createClass(name, teacher_id);
    res.send(classes);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).send('Error creating class');
  }
})

app.post('/createProcedure', async (req, res) => {
  const { procedureName, date, userid, score, errors, time } = req.body;

  if(!procedureName || !date || !userid || !score || !errors || !time){
    res.status(400).send('Falta algun campo');
    return;
  }
  try {
    const procedure = await createProcedure(procedureName, date, userid, score, errors, time);
    console.log(procedure);
    res.send(procedure);
  } catch (error) {
    console.error('Error creating procedure:', error);
    res.status(500).send('Error creating procedure');
  }
})

app.get('/getProcedure/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const procedure = await getProcedure(id);
    res.status(200).send(procedure);
  } catch (error) {
    console.error('Error getting procedure:', error);
    res.status(500).send('Error getting procedures');
  }

})

app.get('/getProcedures/:userid', async (req, res) => {
  const userid = req.params.userid;
  try {
    const procedures = await getProcedures(userid);
    res.status(200).send(procedures);
  } catch (error) {
    console.error('Error getting procedures:', error);
    res.status(500).send('Error getting procedures');
  }

})



app.get('/getClasses/:userid', async (req, res) => {
  const userid = req.params.userid;
  try {
    const classes = await getClasses(userid);
    res.status(200).send(classes);
  } catch (error) {
    console.error('Error getting classes:', error);
    res.status(500).send('Error getting classes');
  }
})

app.listen(process.env.PORT, () => {
  console.log(`Server running at PORT ${process.env.PORT}/`);
});


