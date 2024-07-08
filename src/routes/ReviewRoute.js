const { validateRequestBody } = require("../function/Validator");
const { SearchUserForAccessIdDB } = require("../model/DataKeuanganModel");
const { AddReviewUserToDB } = require("../model/Review");

const GetReviewUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const GetAllReview = await GetAllReviewForSpecificUserDB(user[0]);

    if (!GetAllReview) {
      return res.status(400).send({ msg: "Error Fetching Your Review to Database" });
    }

    res.status(200).send({ msg: "Successfully added review", data: GetAllReview });
  } catch (error) {
    res.status(500).send({ msg: `Error: ${error.message}` });
  }
};

const AddReviewUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;
    const requiredFields = ["review", "post_id"];

    // Validate request body
    const isValidRequest = validateRequestBody(data, requiredFields);
    if (!isValidRequest) {
      return res.status(400).send({ msg: "Incomplete or invalid data provided." });
    }

    // Attempt to add the review to the database
    const addingReviewUser = await AddReviewUserToDB(data, userId);

    if (!addingReviewUser) {
      return res.status(500).send({ msg: "Failed to add review to the database." });
    }

    // Successfully added the review
    res.status(201).send({ msg: "Successfully added review", data: addingReviewUser });
  } catch (error) {
    res.status(500).send({ msg: `Error: ${error.message}` });
  }
};

module.exports = { AddReviewUser, GetReviewUser };
