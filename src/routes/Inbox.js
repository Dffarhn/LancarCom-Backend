const { validateRequestBody } = require("../function/Validator");
const { SearchUserForAccessIdDB } = require("../model/DataKeuanganModel");
const { addMessageToDB, GetAllInboxToDB, GetSpesificInboxToDB } = require("../model/inbox");

const SendRekomendasiRoute = async (req, res) => {
  try {
    const userId = req.user.id;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { access_id } = user[0];

    const data = req.body;

    const requiredFields = ["isi_rekomendasi", "rekomendasi_ke"];

    const isValidRequest = validateRequestBody(data, requiredFields);
    if (!isValidRequest) {
      throw new Error("Incomplete data provided.");
    }

    const SendMessage = await addMessageToDB(data, access_id);

    if (!SendMessage) {
      return res.status(500).send({ msg: "Failed to Send Message" });
    }

    res.status(201).send({ msg: `Your Message Is Send`, data: SendMessage });
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};

const GetAllRekomendasiRoute = async (req, res) => {
  try {
    const userId = req.user.id;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { access_id } = user[0];

    const GetAllInbox = await GetAllInboxToDB(access_id);

    if (!GetAllInbox) {
      return res.status(500).send({ msg: "Failed to Send Message" });
    }

    res.status(200).send({ msg: "Query Successfully", data: GetAllInbox });
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};
const GetSpesificRekomendasiRoute = async (req, res) => {
  try {
    const userId = req.user.id;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { access_id } = user[0];

    const {id} = req.params

    const GetInbox = await GetSpesificInboxToDB(id,access_id);

    console.log(GetInbox)

    if (!GetInbox) {
      return res.status(500).send({ msg: "Failed to Send Message" });
    }

    res.status(200).send({ msg: "Query Successfully", data: GetInbox });
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};

module.exports = { SendRekomendasiRoute, GetAllRekomendasiRoute, GetSpesificRekomendasiRoute };
