const pool = require("../../db_connect");
const { KelolaRekomendasiText } = require("../function/AIchat");
const { validatorUUID } = require("../function/Validator");
const { GetAllDataPembangunansDB } = require("./Pembangunan");
const { GetAllProgressPembangunanToDB } = require("./ProgressPembangunan");

async function GetTheChild(access_id) {
  try {
    const validasi_access = validatorUUID(access_id);

    if (!validasi_access) {
      throw new Error("Your access is not valid");
    }
    const queryValues = [access_id];
    const queryText = `
        select * from access_id 
        where parent = $1`;

    const { rows } = await pool.query(queryText, queryValues);

    if (!rows) {
      throw new Error("Your Place not have child place");
    }

    return rows;
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function AddRekomendasiToDB(data) {
  try {
    const validasi_access = validatorUUID(data.id);

    const pisahkondisirekomendasi = KelolaRekomendasiText(data.rekomendasi_ai);

    if (!validasi_access) {
      throw new Error("Your access is not valid");
    }
    const queryValues = [data.id, pisahkondisirekomendasi.rekomendasiAi, pisahkondisirekomendasi.kondisi, pisahkondisirekomendasi.alasan, data.tipe];
    const queryText = `
            INSERT INTO public.rekomendasi_ai(
            rekomendasi_ke,rekomendasi_ai, kondisi, alasan, type)
            VALUES ($1, $2, $3, $4,$5);
        
        `;

    const { rows } = await pool.query(queryText, queryValues);

    if (!rows) {
      throw new Error("Your Place not have child place");
    }

    return rows;
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function GetRekomendasiAItoDB(data, limit, offset, tipe, searchQuery) {
  try {
    // Construct placeholders for the IN clause
    const placeholders = data.map((_, index) => `$${index + 1}`).join(", ");
    const addsomelimit = `LIMIT ${limit} OFFSET ${offset};`;
    
    // Construct the query text with the dynamic IN clause and search query
    const queryText = `
        WITH ranked_recommendations AS (
            SELECT 
                r.*,
                ROW_NUMBER() OVER (PARTITION BY r.rekomendasi_ke ORDER BY r.created_at DESC) as rn
            FROM rekomendasi_ai r
            LEFT JOIN access_id a ON r.rekomendasi_ke = a.id
            WHERE r.rekomendasi_ke IN (${placeholders})
                AND r.type = '${tipe}'
                AND a.asal_daerah LIKE '%${searchQuery}%'
        )
        SELECT 
            rr.*,
            a.asal_daerah
        FROM ranked_recommendations rr
        LEFT JOIN access_id a ON rr.rekomendasi_ke = a.id
        WHERE rr.rn = 1
        ORDER BY rr.kondisi DESC
        ${addsomelimit};
    `;

    // Execute the query with the data array as the parameter values
    const { rows } = await pool.query(queryText, data);

    return rows; // Assuming you want to return the result
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function GetSpesificRekomendasiAItoDB(data, tipe) {
  try {
    console.log(data);
    // Construct placeholders for the IN clause
    // Construct the query text with the dynamic IN clause
    const queryText = `
          WITH ranked_recommendations AS (
            SELECT 
                r.*,
                ROW_NUMBER() OVER (PARTITION BY r.rekomendasi_ke ORDER BY r.created_at DESC) AS rn
            FROM rekomendasi_ai r
            WHERE r.rekomendasi_ke = $1
              AND r.type = '${tipe}'
        )
        SELECT 
            rr.*,
            a.asal_daerah
        FROM ranked_recommendations rr
        LEFT JOIN access_id a ON rr.rekomendasi_ke = a.id
        WHERE rr.rn = 1
        ORDER BY rr.kondisi DESC;



        `;

    // Execute the query with the data array as the parameter values
    const { rows } = await pool.query(queryText, [data]);

    return rows; // Assuming you want to return the result
  } catch (error) {
    throw new Error(`${error.message}`);
    //const async ufnctin ( message ) {const id : sama dengan pou melakukan semua kegiatan ini}
    // {try catch {}}
    // async functuon to do this i will const Register USer Login User require )
  }
}

async function GetDetailPembangunanAndUpdatedProgressPembangunan(access_id) {
  try {
    const GetAllDataPembangunan = await GetAllDataPembangunansDB(access_id);

    const GetAllProgressPembangunan = await GetAllProgressPembangunanToDB(access_id);

    // const queryText = `Select * from `

    // const queryValues = [access_id]

    // const {rows} = await pool.query(queryText,queryValues)

    // if (rows) {
    //   return rows

    // }else{
    //   throw new Error(`error to get data or u dont have any data`);

    // }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

module.exports = { GetTheChild, AddRekomendasiToDB, GetRekomendasiAItoDB, GetDetailPembangunanAndUpdatedProgressPembangunan, GetSpesificRekomendasiAItoDB };
