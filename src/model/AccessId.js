const pool = require("../../db_connect");

async function GetAllDaerahDB() {
  try {
    const queryText = `Select asal_daerah FROM access_id`;
    const { rows } = await pool.query(queryText);

    return rows;
  } catch (error) {
    throw new Error("Cannot Fetch To Database");
  }
}
async function GetSpesificDaerahDB(access_id) {
  try {
    const queryText = `Select asal_daerah FROM access_id WHERE id = $1`;
    const queryValues = [access_id];
    const { rows } = await pool.query(queryText, queryValues);

    return rows[0];
  } catch (error) {
    throw new Error("Cannot Fetch To Database");
  }
}

async function AddAccessIdToUserDB(data, user) {
  try {
    const queryValues1 = [data];
    const queryText1 = `Select id from access_id where asal_daerah = $1`;
    const SearchAccessId = await pool.query(queryText1, queryValues1);
    const queryValues2 = [user, SearchAccessId[0].id];
    const queryText2 = `UPDATE public.userdb
            SET access_id=$2
            WHERE id=$1;
            `;

    const applyAccessID = await pool.query(queryText2, queryValues2);
    return applyAccessID;
  } catch (error) {
    throw new Error("Failed Aplly the access_id");
  }
}

module.exports = { GetAllDaerahDB, AddAccessIdToUserDB, GetSpesificDaerahDB };
