const { createUser, logIn, getProcedures, checkUser } = require('./database');
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
        await createUser(email, password, type, name);
        res.status(200).send('Usuario Creado');
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

app.post('/getProcedures', async (req, res) => {
  const { userid } = req.body;
  try {
    const procedures = await getProcedures(userid);
    res.send(procedures);
  } catch (error) {
    console.error('Error getting procedures:', error);
    res.status(500).send('Error getting procedures');
  }

})

app.listen(process.env.PORT, () => {
  console.log(`Server running at PORT ${process.env.PORT}/`);
});


