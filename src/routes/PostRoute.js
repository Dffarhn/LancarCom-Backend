const { AddPostUserToDB } = require("../model/Post");

const AddPostUser = async (req, res) => {
  try {
    const userId = req.user.id;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = req.body;
    const requiredFields = ["judul_post", "image_post", "deskripsi_post"];

    const isValidRequest = validateRequestBody(data, requiredFields);
    if (!isValidRequest) {
      throw new Error("Incomplete data provided.");
    }

    const AddingPostUser = await AddPostUserToDB(data, user[0]);

    if (AddingPostUser) {
      res.status(201).send({ msg: "Successfully Added Post", data: AddingPostUser });
    }
  } catch (error) {
    res.status(500).send({ msg: `${error.message}` });
  }
};

module.exports = { AddPostUser };
