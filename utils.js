const checkEmail = (email) => {
  // Expresión regular para validar un correo electrónico
  const regexCorreoElectronico = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexCorreoElectronico.test(email);
}

module.exports = { checkEmail };

