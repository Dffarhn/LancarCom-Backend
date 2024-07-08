const { validateRequestBody } = require("../function/Validator");
const { AddUser, SearchUser } = require("../model/user");
const jwt = require("jsonwebtoken");

const LoginUser = async (req, res) => {
  try {
    const data = req.body;
    const requiredFields = ["email", "password"];

    const isValidRequest = validateRequestBody(data, requiredFields);
    if (!isValidRequest) {
      throw new Error("Incomplete data provided.");
    }

    const searchingUser = await SearchUser(data);

    // console.log(searchingUser)

    if (searchingUser) {
      const payload = { id: searchingUser.id, username: searchingUser.username, email: searchingUser.email, role: searchingUser.role || undefined };
      const accessToken = jwt.sign(payload, process.env.SECRET_KEY_TOKEN, {
        expiresIn: "1d",
      });
      const refreshToken = jwt.sign(payload, process.env.SECRET_KEY_REFRESH_TOKEN, {
        expiresIn: "1d",
      });

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      searchingUser.accessToken = accessToken;
      searchingUser.password = undefined;
      searchingUser.access_id = undefined;

      res.status(200).send({ msg: "Login successful", data: searchingUser });
    } else {
      res.status(500).send({ msg: "User Not Found" });
    }
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
};

const RegisterUser = async (req, res) => {
  try {
    const data = req.body;
    const requiredFields = ["username", "email", "password", "asal_daerah"];

    const isValidRequest = validateRequestBody(data, requiredFields);
    if (!isValidRequest) {
      throw new Error("Incomplete data provided.");
    }

    const newUser = await AddUser(data);

    if (newUser) {
      const payload = { id: newUser.id, username: newUser.username, email: newUser.email };
      const accessToken = jwt.sign(payload, process.env.SECRET_KEY_TOKEN, {
        expiresIn: "10m",
      });
      const refreshToken = jwt.sign(payload, process.env.SECRET_KEY_REFRESH_TOKEN, {
        expiresIn: "1d",
      });

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      newUser.accessToken = accessToken;

      res.status(201).send({ msg: "Registration successful", data: newUser });
    } else {
      res.status(500).send({ msg: "Internal server error" });
    }
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
};
