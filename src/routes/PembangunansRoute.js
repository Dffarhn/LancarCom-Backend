const { validateRequestBody } = require("../function/Validator");
const { SearchUserForAccessIdDB } = require("../model/DataKeuanganModel");
const { GetAllDataPembangunansDB, getDataPembangunanDB, AddDataPembangunanToDB, UpdatePembangunanToDB, GetAllStatisticPembangunansDB } = require("../model/Pembangunan");

const AddPembangunan = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { access_id } = user[0];

    const data = req.body;
    console.log(data);
    const requiredFields = ["nama_pembangunan", "lokasi_pembangunan", "dana_pembangunan"];

    const isValidRequest = validateRequestBody(data, requiredFields);
    if (!isValidRequest) {
      throw new Error("Incomplete data provided.");
    }

    const AddDataPembangunan = await AddDataPembangunanToDB(data, access_id);

    if (AddDataPembangunan) {
      res.status(200).send({ msg: "Query Successfully", data: AddDataPembangunan });
    } else {
      throw new Error("failed to get fetch from Database");
    }
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};

const GetAllPembangunan = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { access_id } = user[0];

    const getAllDataPembangunan = await GetAllDataPembangunansDB(access_id);

    if (getAllDataPembangunan) {
      res.status(200).send({ msg: "Query Successfully", data: getAllDataPembangunan });
    } else {
      throw new Error("failed to get fetch from Database");
    }
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};

const GetPembangunan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pembangunan_id } = req.params;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { access_id } = user[0];

    const getDataPembangunan = await getDataPembangunanDB(pembangunan_id, access_id);

    if (getDataPembangunan) {
      res.status(200).send({ msg: "Query Successfully", data: getDataPembangunan });
    } else {
      throw new Error("failed to get fetch from Database");
    }
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};

const UpdatePembangunan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pembangunan_id } = req.params;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const data_update = req.body;

    const data = {
      id: pembangunan_id,
      nama_pembangunan: data_update.nama_pembangunan || null,
      lokasi_pembangunan: data_update.lokasi_pembangunan || null,
      dana_pembangunan: data_update.dana_pembangunan || null,
      status_pembangunan: data_update.status_pembangunan || null,
    };
    const filteredData = Object.fromEntries(Object.entries(data).filter(([key, value]) => value !== null));

    console.log(filteredData);

    const hasil_update = await UpdatePembangunanToDB(filteredData);

    if (hasil_update.rowCount >= 1) {
      res.status(200).send({ msg: "Query Successfully", data: hasil_update });
    } else {
      throw new Error("failed to get fetch from Database");
    }
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};



const GetStatisticAllPembangunan = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { access_id } = user[0];

    const getAllDataPembangunan = await GetAllStatisticPembangunansDB(access_id);

    if (getAllDataPembangunan) {
      res.status(200).send({ msg: "Query Successfully", data: getAllDataPembangunan });
    } else {
      throw new Error("failed to get fetch from Database");
    }
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};

module.exports = { GetAllPembangunan, GetPembangunan, AddPembangunan, UpdatePembangunan, GetStatisticAllPembangunan };
