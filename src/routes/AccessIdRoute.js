const { GetAllDaerahDB, AddAccessIdToUserDB } = require("../model/AccessId");

const GetAllDaerahAccessId = async (req, res) => {
  try {
    const GetAllDaerah = await GetAllDaerahDB();

    res.status(200).send({ msg: "successfully fetch daerah", data: GetAllDaerah });
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};

const AddRequestAccessId = async (req, res) => {
  try {
    // Verify and decode the JWT to extract the user ID
    const userId = req.user.id;
    const { selected_region } = req.body;

    const updateUserAccessId = await AddAccessIdToUserDB(selected_region, userId);
    if (updateUserAccessId) {
      res.status(201).send({ msg: "successfully apply access_id" });
    }
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};

module.exports = { GetAllDaerahAccessId, AddRequestAccessId };
