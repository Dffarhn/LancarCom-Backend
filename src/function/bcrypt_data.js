const bcrypt = require("bcrypt");

function bcrypt_data(data) {
  const saltRounds = 10;
  const passwordToHash = data;

  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        console.error("Error generating salt:", err);
        reject(err);
      }

      bcrypt.hash(passwordToHash, salt, (err, hashedPassword) => {
        if (err) {
          console.error("Error hashing password:", err);
          reject(err);
        }
        resolve(hashedPassword);
      });
    });
  });
}
function comparePasswordBcrypt(plainPassword, hashedPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          reject(err);
        }
        resolve(result); // result will be true if passwords match, false otherwise
      });
    });
  }

module.exports = { bcrypt_data,comparePasswordBcrypt };
