const pool = require("../../db_connect");
const { validateNoSpaces } = require("../function/Validator");

async function GetAllReviewForSpecificUserDB(user) {
  try {
    const { access_id } = user;

    const queryText = `
            
            SELECT
            p.id AS post_id,
            p.judul_post AS post_title,
            u.access_id AS uploader_id,
            u.username AS uploader_name,
            json_agg(json_build_object(
                'review_id', r.id,
                'review_content', r.isi_review,
                'reviewer_id', ru.id,
                'reviewer_name', ru.username
            )) AS reviews
            FROM
                review r
            JOIN
                post p ON r.post_id = p.id
            JOIN
                userdb u ON p.pengupload_post = u.access_id
            JOIN
                userdb ru ON r.user_id = ru.id
            WHERE
                u.access_id = $1
            GROUP BY
                p.id, u.id;
      `;

    const queryValues = [access_id];

    const { rows } = await pool.query(queryText, queryValues);

    if (!rows || rows.length === 0) {
      throw new Error("No reviews found for the specified user.");
    }

    return rows;
  } catch (error) {
    throw new Error(`Error fetching reviews: ${error.message}`);
  }
}

async function AddReviewUserToDB(data, user) {
  try {
    const { review, post_id } = data;
    const user_id = user;

    const validReview = validateNoSpaces(review);

    if (!validReview) {
      throw new Error("Your review is not valid");
    }

    const queryText = `
            INSERT INTO public.review (isi_review, user_id, post_id)
            VALUES ($1, $2, $3)
            RETURNING isi_review;
        `;

    const queryValues = [review, user_id, post_id];

    const { rows } = await pool.query(queryText, queryValues);

    if (rows.length > 0) {
      return rows[0];
    } else {
      throw new Error("Failed to add review to database");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

module.exports = { GetAllReviewForSpecificUserDB, AddReviewUserToDB };
