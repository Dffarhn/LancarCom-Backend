const pool = require("../../db_connect");

async function AddPostUserToDB(data, user) {
  try {
    const { judul_post, image_post, deskripsi_post } = data;

    const { access_id } = user;

    const tgl_post = new Date();

    const queryValues = [judul_post, image_post, deskripsi_post, tgl_post, access_id];

    const queryText = `INSERT INTO public.post(
            judul_post, image_post, deskripsi_post, tgl_post, pengupload_post)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING id
            `;

    const { rows } = await pool.query(queryText, queryValues);

    if (rows) {
      throw new Error("Failed Add Post To Database");
    }
    return rows;
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function GetPostFromAccessId(access_ids) {
  try {
    // Construct the IN clause for the query
    const inClause = access_ids.map((id, index) => `$${index + 1}`).join(", ");
    // Construct the query text
    const queryText = `
        SELECT 
            access_id.id AS id,
            access_id.asal_daerah AS nama_daerah,
            json_agg(review.isi_review) AS reviews
        FROM 
            public.access_id
        LEFT JOIN
            public.post ON access_id.id = post.pengupload_post
        LEFT JOIN
            public.review ON post.id = review.post_id
        WHERE 
            access_id.id IN (${inClause})
        GROUP BY
            access_id.id;



    `; // Execute the query
    const { rows } = await pool.query(queryText, access_ids);
    // Return the result
    return rows;
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

module.exports = { AddPostUserToDB, GetPostFromAccessId };
