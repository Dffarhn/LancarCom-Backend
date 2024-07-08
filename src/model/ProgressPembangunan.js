const pool = require("../../db_connect");
const { validatorUUID } = require("../function/Validator");

const { UpdateDompetAuthDB } = require("./DompetAuth");
const { UpdatePembangunanToDB, getDataPembangunanDB } = require("./Pembangunan");

async function AddProgressPembangunanToDB(data) {
  try {
    const { id_pembangunan, image_progress, progress_pembangunan, dana_digunakan, access_id } = data;
    const DateCreate = new Date();

    let DanaSisa = 0;

    const GetUpToDateProgress = await GetAllProgressPembangunanToDB(access_id);

    const filteredProgress = GetUpToDateProgress.filter((progress) => progress.id_pembangunan === id_pembangunan);

    if (filteredProgress.length > 0) {
      const previousDanaSisa = BigInt(filteredProgress[0].dana_sisa || 0);
      const digunakan = BigInt(dana_digunakan || 0);
      DanaSisa = previousDanaSisa - digunakan;
    } else {
      const GetFirstPembangunan = await getDataPembangunanDB(id_pembangunan, access_id);

      if (GetFirstPembangunan.length > 0) {
        const danaPembangunan = BigInt(GetFirstPembangunan[0].dana_pembangunan || 0);
        const digunakan = BigInt(dana_digunakan || 0);
        DanaSisa = danaPembangunan - digunakan;
      } else {
        throw new Error("Pembangunan tidak ditemukan.");
      }
    }

    const queryValues = [id_pembangunan, image_progress, progress_pembangunan, dana_digunakan, DanaSisa, DateCreate];
    const queryText = `
      INSERT INTO public.progress_pembangunan(
        id_pembangunan, image_progress, progress_pembangunan, dana_digunakan, dana_sisa, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, dana_digunakan;
    `;

    const { rows } = await pool.query(queryText, queryValues);

    if (!rows) {
      throw new Error("Failed to insert data into Database");
    }

    if (parseInt(progress_pembangunan, 10) === 100) {
      const updateData = {
        id: id_pembangunan,
        status_pembangunan: "completed",
      };

      await UpdatePembangunanToDB(updateData);
    }

    const dataUpdateDompet = {
      access_id: access_id,
      uang_keluar: rows[0].dana_digunakan,
      tanggal_update: new Date(),
    };

    await UpdateDompetAuthDB(dataUpdateDompet);

    return rows;
  } catch (error) {
    throw new Error(`Error in AddProgressPembangunanToDB: ${error.message}`);
  }
}

async function GetProgressPembangunanToDB(data, access_id) {
  try {
    const validasiUUID = validatorUUID(data);

    if (!validasiUUID) {
      throw new Error("Your data is not Valid");
    }
    const queryValues = [access_id, data];

    const queryText = `
        SELECT DISTINCT ON (pp.id_pembangunan)
        pp.id,
        pp.id_pembangunan,
        pp.image_progress,
        pp.progress_pembangunan,
        pp.dana_digunakan,
        pp.dana_sisa,
        pp.created_at,
        p.nama_pembangunan,
        p.lokasi_pembangunan,
        p.dana_pembangunan,
        p.status_pembangunan,
        p.pemilik_pembangunan
    FROM
        public.progress_pembangunan pp
    JOIN
        public.pembangunan p
    ON
        pp.id_pembangunan = p.id
    WHERE
        p.pemilik_pembangunan = $1 AND pp.id = $2
    ORDER BY
        pp.id_pembangunan,
        pp.created_at DESC;



        
        `;

    const { rows } = await pool.query(queryText, queryValues);

    if (!rows) {
      throw new Error("Failed To get data to Database");
    }

    return rows;
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}
async function GetAllProgressPembangunanToDB(access_id) {
  try {
    const validasiUUID = validatorUUID(access_id);

    if (!validasiUUID) {
      throw new Error("Your data is not Valid");
    }

    // console.log(access_id)
    const queryValues = [access_id];

    const queryText = `
    SELECT DISTINCT ON (pp.id_pembangunan)
        pp.id,
        pp.id_pembangunan,
        pp.image_progress,
        pp.progress_pembangunan,
        pp.dana_digunakan,
        pp.dana_sisa,
        pp.created_at,
        p.nama_pembangunan,
        p.lokasi_pembangunan,
        p.dana_pembangunan,
        p.status_pembangunan,
        p.pemilik_pembangunan
    FROM
        public.progress_pembangunan pp
    LEFT JOIN
        public.pembangunan p
    ON
        pp.id_pembangunan = p.id
    WHERE
        p.pemilik_pembangunan = $1
    ORDER BY
        pp.id_pembangunan,
        pp.created_at DESC;


        
        `;

    const { rows } = await pool.query(queryText, queryValues);

    if (!rows) {
      throw new Error("Failed To get data to Database");
    }

    return rows;
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

module.exports = {
  AddProgressPembangunanToDB,
  GetProgressPembangunanToDB,
  GetAllProgressPembangunanToDB,
};
