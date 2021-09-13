require("dotenv").config({ path: "variables.env" });
const jwt = require("jsonwebtoken");

async function generarToken(user) {
  const { id, email } = user;
  const payload = { id, email };
  return jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "2h",
  });
}

module.exports = {
  generarToken,
};
