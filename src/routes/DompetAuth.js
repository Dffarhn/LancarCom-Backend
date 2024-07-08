const { validatorUUID } = require("../function/Validator");
const { SearchUserForAccessIdDB } = require("../model/DataKeuanganModel");
const { GetDompetAuthDB, UpdateDompetAuthDB, GetStatisticDompetDB } = require("../model/DompetAuth");

const GetDompet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pembangunan_id } = req.params;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { access_id } = user[0];

    const GetDataDompet = await GetDompetAuthDB(access_id);

    res.status(200).json({ msg: "QuerySuccessfully", data: GetDataDompet });
  } catch (error) {
    // Send an error response with a status code and error message
    res.status(500).json({ message: `Failed to get dompet: ${error.message}` });
  }
};

// async function UpdateDompet(data_update, access_id) {
//   try {
//     if (!validatorUUID(access_id)) {
//       throw new Error("Invalid access ID");
//     }

//     const data = {
//       access_id: access_id,
//       uang_masuk: data_id.uang_masuk || null,
//       uang_keluar: data_update.uang_keluar || null,
//       uang_sekarang: data_update.uang_sekarang || null,
//       tanggal_update: new Date(),
//     };
//     const filteredData = Object.fromEntries(Object.entries(data).filter(([key, value]) => value !== null));

//     console.log(filteredData);

//     const hasil_update = await UpdateDompetAuthDB(filteredData, access_id);
//     if (hasil_update) {
//       return true;
//     } else {
//       throw new Error("Update failed");
//     }
//   } catch (error) {
//     console.log(error.message);
//     throw new Error(`Update failed: ${error.message}`);
//   }
// }

const GetStatisticDompet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pembangunan_id } = req.params;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { access_id } = user[0];

    const getStatisticdata = await GetStatisticDompetDB(access_id);

    if (getStatisticdata) {
      res.status(200).send({ msg: "Query Successfully", data: getStatisticdata });
    } else {
      throw new Error("failed to get fetch from Database");
    }
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};
module.exports = {
  GetDompet,
  // UpdateDompet,
  GetStatisticDompet,
};
