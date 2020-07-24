const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');

const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
require('dotenv').config({ path: 'variables.env' });

//DB
const conectarDB = require('./config/db');
//conectar DB
conectarDB();

//servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers['authorization'] || '';
    if (token) {
      try {
        const usuario = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.SECRETO
        );
        // console.log(usuario);
        return {
          usuario
        };
      } catch (error) {
        console.log('hubo un error');
        console.log(error);
      }
    }
  }
});
//el context esta disponible en todos los resolvers

//arrancar servidor
server.listen().then(({ url }) => {
  console.log(`Servidor listo en la Url ${url}`);
});
