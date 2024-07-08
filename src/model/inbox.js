const pool = require("../../db_connect");
const { validatorUUID } = require("../function/Validator");

async function addMessageToDB(data, accessId) {
  try {
    const { isi_rekomendasi, rekomendasi_ke } = data;

    console.log(data)

    const isValidIsiRekomendasi = validatorUUID(isi_rekomendasi);
    const isValidRekomendasiKe = validatorUUID(rekomendasi_ke);

    if (!isValidIsiRekomendasi) {
      throw new Error("Invalid isi_rekomendasi UUID");
    }
    if (!isValidRekomendasiKe) {
      throw new Error("Invalid rekomendasi_ke UUID");
    }

    const queryText = `
      INSERT INTO public.inbox(
        isi_rekomendasi, rekomendasi_ke, rekomendasi_dari
      ) VALUES ($1, $2, $3)
      RETURNING id;
    `;

  

    const queryValues = [isi_rekomendasi, rekomendasi_ke, accessId];

    const { rows } = await pool.query(queryText, queryValues);
    console.log(rows)

    if (rows.length > 0) {
      return rows[0]; // Assuming you want to return the first row
    } else {
      throw new Error("Failed to add message to database");
    }
  } catch (error) {
    throw new Error(`Error in addMessageToDB: ${error.message}`);
  }
}

async function GetAllInboxToDB(access_id) {
  try {
    const isValidPunyaRekomendasi = validatorUUID(access_id);

    if (!isValidPunyaRekomendasi) {
      throw new Error("Invalid Penerima UUID");
    }
    const queryText = `
    SELECT i.*, RA.rekomendasi_ke, RA.rekomendasi_ai, RA.alasan, AI.asal_daerah 
    FROM inbox i
    JOIN rekomendasi_ai RA ON RA.id = i.isi_rekomendasi
    JOIN access_id AI ON i.rekomendasi_dari = AI.id
    WHERE i.rekomendasi_ke = $1
`;
    const queryValues = [access_id];

    const { rows } = await pool.query(queryText, queryValues);

    console.log(rows)

    if (rows) {
      return rows; // Assuming you want to return the first row
    } else {
      throw new Error("Failed to get message to database");
    }
  } catch (error) {
    throw new Error(`Error in addMessageToDB: ${error.message}`);
  }
}
async function GetSpesificInboxToDB(id,access_id) {
  try {
    const isValidPunyaRekomendasi = validatorUUID(access_id);
    console.log(id)

    if (!isValidPunyaRekomendasi) {
      throw new Error("Invalid Penerima UUID");
    }
    const queryText = `
    SELECT i.*, RA.rekomendasi_ke, RA.rekomendasi_ai, RA.alasan, AI.asal_daerah 
    FROM inbox i
    JOIN rekomendasi_ai RA ON RA.id = i.isi_rekomendasi
    JOIN access_id AI ON i.rekomendasi_dari = AI.id  
    where i.rekomendasi_ke = $1 AND i.id = $2`;
    const queryValues = [access_id,id];

    const { rows } = await pool.query(queryText, queryValues);

    if (rows) {
      return rows; // Assuming you want to return the first row
    } else {
      throw new Error("Failed to get message to database");
    }
  } catch (error) {
    throw new Error(`Error in addMessageToDB: ${error.message}`);
  }
}

module.exports = { addMessageToDB, GetAllInboxToDB,GetSpesificInboxToDB };
