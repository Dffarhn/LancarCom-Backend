const pool = require("../../db_connect");
const { validatorUUID, validateNoSpacesArray, validateNoSpaces, validateNumber } = require("../function/Validator");

async function AddDataPembangunanToDB(data, access_id) {
  try {
    const { nama_pembangunan, lokasi_pembangunan, dana_pembangunan } = data;
    const queryValues = [nama_pembangunan, lokasi_pembangunan, dana_pembangunan];

    queryValues.push("pending");

    queryValues.push(access_id);

    const validasinullname = validateNoSpacesArray([nama_pembangunan, lokasi_pembangunan]);

    const validasiaccess_id = validatorUUID(access_id);

    if (validasiaccess_id && validasinullname) {
      const queryText = `
            INSERT INTO public.pembangunan(
            nama_pembangunan, lokasi_pembangunan, dana_pembangunan, status_pembangunan, pemilik_pembangunan)
            VALUES ($1, $2, $3, $4, $5)

            RETURNING id;
            `;

      const { rows } = await pool.query(queryText, queryValues);

      if (rows) {
        return rows;
      } else {
        throw new Error("Failed to add Data Pembangunan To Database");
      }
    } else {
      throw new Error("Your Data Is Not Valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function GetAllDataPembangunansDB(access_id) {
  try {
    const validasiuuid = validatorUUID(access_id);

    const queryText = `
            
            SELECT P.*, 
                json_build_object(
                    'image_progress', PP.image_progress, 
                    'progress_pembangunan', PP.progress_pembangunan, 
                    'dana_digunakan', PP.dana_digunakan, 
                    'dana_sisa', PP.dana_sisa
                ) AS progress
            FROM pembangunan P
            LEFT JOIN (
                SELECT PP1.*
                FROM progress_pembangunan PP1
                JOIN (
                    SELECT id_pembangunan, MAX(progress_pembangunan) AS max_progress
                    FROM progress_pembangunan
                    GROUP BY id_pembangunan
                ) max_progress_table
                ON PP1.id_pembangunan = max_progress_table.id_pembangunan
                AND PP1.progress_pembangunan = max_progress_table.max_progress
            ) PP
            ON P.id = PP.id_pembangunan
            WHERE P.pemilik_pembangunan = $1;


        `;

    if (validasiuuid) {
      const { rows } = await pool.query(queryText, [access_id]);
      console.log(rows);
      if (rows) {
        return rows;
      } else {
        throw new Error("Failed to fetch into database");
      }
    } else {
      throw new Error("Your uuid is not valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function getDataPembangunanDB(id_pembangunan, access_id) {
  try {
    const validasiuuid = validatorUUID(access_id);

    const queryText = `
        SELECT P.*, 
            json_build_object(
                'image_progress', PP.image_progress, 
                'progress_pembangunan', PP.progress_pembangunan, 
                'dana_digunakan', PP.dana_digunakan, 
                'dana_sisa', PP.dana_sisa
            ) AS progress
        FROM pembangunan P
        LEFT JOIN (
            SELECT PP1.*
            FROM progress_pembangunan PP1
            JOIN (
                SELECT id_pembangunan, MAX(progress_pembangunan) AS max_progress
                FROM progress_pembangunan
                GROUP BY id_pembangunan
            ) max_progress_table
            ON PP1.id_pembangunan = max_progress_table.id_pembangunan
            AND PP1.progress_pembangunan = max_progress_table.max_progress
        ) PP
        ON P.id = PP.id_pembangunan
        WHERE P.pemilik_pembangunan = $1
        AND P.id = $2;

 
        `;

    if (validasiuuid) {
      const { rows } = await pool.query(queryText, [access_id, id_pembangunan]);
      console.log(rows);
      if (rows) {
        return rows;
      } else {
        throw new Error("Failed to fetch into database");
      }
    } else {
      throw new Error("Your uuid is not valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function UpdatePembangunanToDB(data) {
  try {
    const updateColumns = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (key !== "id") {
        if (typeof data[key] == "string") {
          if (validateNoSpaces(data[key])) {
            updateColumns.push(key);
            values.push(data[key]);
          } else {
            throw new Error("Your data is not valid");
          }
        } else {
          console.log(data[key]);
          if (validateNumber(data[key])) {
            updateColumns.push(key);
            // Assuming price should be a number, parse it
            values.push(parseInt(data[key], 10));
          } else {
            throw new Error("Your data is not valid");
          }
        }
      }
    });

    // Periksa apakah ada kolom yang akan diupdate
    if (updateColumns.length > 0) {
      const updateQuery = updateColumns
        .map((col, index) => {
          return `${col}=$${index + 1}`;
        })
        .join(", ");

      values.push(data.id);
      // Buat queryText dengan kolom-kolom yang akan diupdate
      const queryText = `
          UPDATE public.pembangunan
          SET ${updateQuery}
          WHERE id=$${values.length};
          `;

      console.log("Update query:", queryText);
      console.log("Values:", values);
      // Execute your database update query using the queryText and values
      // Example:
      const rows = await pool.query(queryText, values);

      // Return success message or updated data
      // console.log(rows.rowCount);
      return rows;
    } else {
      // Tidak ada kolom yang akan diupdate karena semua nilainya null
      throw new Error("No data to update boy");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function GetAllStatisticPembangunansDB(access_id) {
  try {
    const validasiuuid = validatorUUID(access_id);

    const queryText = `
            
            SELECT
                SUM(CASE WHEN P.status_pembangunan = 'pending' THEN 1 ELSE 0 END) AS count_pending,
                SUM(CASE WHEN P.status_pembangunan = 'ongoing' THEN 1 ELSE 0 END) AS count_ongoing,
                SUM(CASE WHEN P.status_pembangunan = 'completed' THEN 1 ELSE 0 END) AS count_completed
            FROM
                pembangunan P
            WHERE
                P.pemilik_pembangunan = $1;



        `;

    if (validasiuuid) {
      const { rows } = await pool.query(queryText, [access_id]);
      console.log(rows);
      if (rows) {
        return rows;
      } else {
        throw new Error("Failed to fetch into database");
      }
    } else {
      throw new Error("Your uuid is not valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

module.exports = { GetAllDataPembangunansDB, getDataPembangunanDB, AddDataPembangunanToDB, UpdatePembangunanToDB , GetAllStatisticPembangunansDB};
