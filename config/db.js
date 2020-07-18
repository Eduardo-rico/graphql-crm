const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    console.log('DB CONECTADA');
  } catch (error) {
    console.log('Hubo un error');
    console.log(error);
    process.exit(1); //detiene la app
  }
};

module.exports = conectarDB;
