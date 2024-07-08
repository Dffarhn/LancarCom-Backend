const pool = require("../../db_connect");

async function GetAllRekomendasiAIForSpesificCity(access_id) {
  try {
    const queryText = `
            Select rekomendasi_ai from rekomendasi_ai
            Where rekomendasi_ke = $1
        `;

    const queryValues = [access_id];

    const { rows } = await pool.query(queryText, queryValues);

    if (rows) {
      return rows;
    } else {
      throw new Error("Failed to Fetch Database");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

module.exports = {
  GetAllRekomendasiAIForSpesificCity,
};
