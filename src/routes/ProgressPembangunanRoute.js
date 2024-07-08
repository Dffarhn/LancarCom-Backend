const { validateRequestBody } = require("../function/Validator");
const { SearchUserForAccessIdDB } = require("../model/DataKeuanganModel");
const { AddProgressPembangunanToDB, GetProgressPembangunanToDB, GetAllProgressPembangunanToDB } = require("../model/ProgressPembangunan");

const AddProgressPembangunan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pembangunan_id } = req.params;

    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { access_id } = user[0];

    const data = req.body;
    const requiredFields = ["id_pembangunan", "image_progress", "progress_pembangunan", "dana_digunakan"];
    data.id_pembangunan = pembangunan_id;

    const isValidRequest = validateRequestBody(data, requiredFields);
    if (!isValidRequest) {
      throw new Error("Incomplete data provided.");
    }

    data.access_id = access_id;

    // Await the AddProgressPembangunanToDB function call
    const AddDataProgressPembangunan = await AddProgressPembangunanToDB(data);

    res.status(200).send({ msg: "Query Successfully", data: AddDataProgressPembangunan });
  } catch (error) {
    res.status(500).send({ msg: `Error in AddProgressPembangunan: ${error.message}` });
  }
};

const getProgressPembangunan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { access_id } = user[0];

    const GetProgressPembangunanData = await GetProgressPembangunanToDB(id, access_id);

    if (GetProgressPembangunanData) {
      res.status(200).send({ msg: "Query Successfully", data: GetProgressPembangunanData });
    } else {
      throw new Error("failed to get fetch from Database");
    }
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};
const getAllProgressPembangunan = async (req, res) => {
  try {
    const userId = req.user.id;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { access_id } = user[0];

    const GetAllProgressPembangunanData = await GetAllProgressPembangunanToDB(access_id);

    // console.log(GetAllProgressPembangunanData)

    if (GetAllProgressPembangunanData) {
      res.status(200).send({ msg: "Query Successfully", data: GetAllProgressPembangunanData });
    } else {
      throw new Error("failed to get fetch from Database");
    }
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};

module.exports = {
  AddProgressPembangunan,
  getProgressPembangunan,
  getAllProgressPembangunan,
};
