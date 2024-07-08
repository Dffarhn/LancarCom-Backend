const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const Auth_Access = (req, res, next) => {
  // Get the access token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract the token part

  if (!token) {
    return res.status(400).json({ message: "JWT not found in cookies" });
  }

  // Verify the access token
  jwt.verify(token, process.env.SECRET_KEY_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Access token is invalid." });
    }
    // Token is valid, attach decoded user information to the request object
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  });
};


module.exports={
    Auth_Access
}
