const { ApolloServer } = require("apollo-server");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });
const typeDefs = require("./src/apollo/typeDefs");
const resolvers = require("./src/apollo/resolvers");
const conectarDb = require("./src/db/config");

//Conectar Base de datos
conectarDb();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers["authorization"] || "";
    if (token) {
      try {
        const usuario = jwt.verify(
          token.replace("Bearer ", ""),
          process.env.SECRET_KEY
        );
        return usuario;
      } catch (error) {
        console.log(error);
      }
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Servidor listo en la url ${url}`);
});
