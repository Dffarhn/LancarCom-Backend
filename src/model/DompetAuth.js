const pool = require("../../db_connect");
const { validateNoSpaces, validateNumber, validatorUUID } = require("../function/Validator");

async function GetDompetAuthDB(id) {
  try {
    const queryValues = [id];
    const queryText = `
        WITH latest_uang_masuk AS (
            SELECT uang_masuk, tanggal_update
            FROM public.dompet_keuangan
            WHERE pemilik_dompet = $1
            AND uang_masuk IS NOT NULL
            ORDER BY tanggal_update DESC
            LIMIT 1
        ),
        latest_uang_keluar AS (
            SELECT uang_keluar, tanggal_update
            FROM public.dompet_keuangan
            WHERE pemilik_dompet = $1
            AND uang_keluar IS NOT NULL
            ORDER BY tanggal_update DESC
            LIMIT 1
        ),
        latest_uang_sekarang AS (
            SELECT uang_sekarang, tanggal_update
            FROM public.dompet_keuangan
            WHERE pemilik_dompet = $1
            AND uang_sekarang IS NOT NULL
            ORDER BY tanggal_update DESC
            LIMIT 1
        )
        SELECT
            (SELECT uang_masuk FROM latest_uang_masuk) AS uang_masuk,
            (SELECT uang_keluar FROM latest_uang_keluar) AS uang_keluar,
            (SELECT uang_sekarang FROM latest_uang_sekarang) AS uang_sekarang,
            GREATEST(
                (SELECT tanggal_update FROM latest_uang_masuk),
                (SELECT tanggal_update FROM latest_uang_keluar),
                (SELECT tanggal_update FROM latest_uang_sekarang)
            ) AS tanggal_update_terakhir

        `;

    const { rows } = await pool.query(queryText, queryValues);

    return rows;
  } catch (error) {
    throw new Error(`Failed to get dompet auth: ${error.message}`);
  }
}

async function UpdateDompetAuthDB(data) {
  try {
    const updateColumns = [];
    const values = [];

    let index = 1;
    const placeholder = [];

    Object.keys(data).forEach((key) => {
      if (key !== "access_id" && key !== "tanggal_update") {
        if (typeof data[key] == "string") {
          if (validateNoSpaces(data[key])) {
            updateColumns.push(key);
            values.push(data[key]);
            placeholder.push(`$${index}`);
            index++;
          } else {
            throw new Error("Your data is not valid");
          }
        } else {
          console.log(data[key]);
          if (validateNumber(data[key])) {
            updateColumns.push(key);
            // Assuming price should be a number, parse it
            values.push(BigInt(data[key], 10));
            placeholder.push(`$${index}`);
            index++;
          } else {
            throw new Error("Your data is not valid");
          }
        }
      }
    });

    // Periksa apakah ada kolom yang akan diupdate
    updateColumns.push("pemilik_dompet");
    placeholder.push(`$${index}`);
    values.push(data.access_id);
    index++;

    // Fetch the current wallet condition
    const GetConditionDompet = await GetDompetAuthDB(data.access_id);

    // Update "uang_sekarang" based on the conditions
    let UangSekarangUpdate;
    if (data.uang_masuk !== undefined) {
      UangSekarangUpdate = BigInt(GetConditionDompet[0].uang_sekarang, 10) + BigInt(data.uang_masuk);
    } else if (data.uang_keluar !== undefined) {
      UangSekarangUpdate = BigInt(GetConditionDompet[0].uang_sekarang) - BigInt(data.uang_keluar);
    } else {
      UangSekarangUpdate = GetConditionDompet[0].uang_sekarang;
    }

    updateColumns.push("uang_sekarang");
    placeholder.push(`$${index}`);
    values.push(UangSekarangUpdate);

    // Buat queryText dengan kolom-kolom yang akan diupdate
    const queryText = `
        INSERT INTO public.dompet_keuangan (${updateColumns.join(", ")})
        VALUES (${placeholder.join(", ")});
        `;

    console.log("Update query:", queryText);
    console.log("Values:", values);
    // Execute your database update query using the queryText and values
    // Example:
    const rows = await pool.query(queryText, values);

    // Return success message or updated data
    // console.log(rows.rowCount);
    return rows;
  } catch (error) {
    // Handle the error appropriately
    console.error("Error updating dompet:", error.message);
    // Optionally, you can throw the error again to propagate it to the calling function
    throw error;
  }
}

async function GetStatisticDompetDB(access_id) {
  try {
    const validasiUUID = validatorUUID(access_id);

    const queryText = `
    WITH monthly_uang_masuk AS (
    SELECT 
        EXTRACT(YEAR FROM tanggal_update) AS tahun,
        EXTRACT(MONTH FROM tanggal_update) AS bulan,
        SUM(uang_masuk) AS total_uang_masuk
    FROM 
        public.dompet_keuangan
    WHERE 
        pemilik_dompet = $1
        AND uang_masuk IS NOT NULL
    GROUP BY 
        EXTRACT(YEAR FROM tanggal_update), EXTRACT(MONTH FROM tanggal_update)
),
monthly_uang_keluar AS (
    SELECT 
        EXTRACT(YEAR FROM tanggal_update) AS tahun,
        EXTRACT(MONTH FROM tanggal_update) AS bulan,
        SUM(uang_keluar) AS total_uang_keluar
    FROM 
        public.dompet_keuangan
    WHERE 
        pemilik_dompet = $1
        AND uang_keluar IS NOT NULL
    GROUP BY 
        EXTRACT(YEAR FROM tanggal_update), EXTRACT(MONTH FROM tanggal_update)
),
latest_uang_sekarang AS (
    SELECT DISTINCT ON (EXTRACT(YEAR FROM tanggal_update), EXTRACT(MONTH FROM tanggal_update))
        EXTRACT(YEAR FROM tanggal_update) AS tahun,
        EXTRACT(MONTH FROM tanggal_update) AS bulan,
        uang_sekarang,
        tanggal_update
    FROM 
        public.dompet_keuangan
    WHERE 
        pemilik_dompet = $1
        AND uang_sekarang IS NOT NULL
    ORDER BY 
        EXTRACT(YEAR FROM tanggal_update), EXTRACT(MONTH FROM tanggal_update), tanggal_update DESC
)
SELECT
    COALESCE(mum.tahun, muk.tahun, lus.tahun) AS tahun,
    COALESCE(mum.bulan, muk.bulan, lus.bulan) AS bulan,
    mum.total_uang_masuk AS uang_masuk,
    muk.total_uang_keluar AS uang_keluar,
    lus.uang_sekarang AS uang_sekarang,
    lus.tanggal_update AS tanggal_update_terakhir
FROM
    monthly_uang_masuk mum
    FULL JOIN monthly_uang_keluar muk ON mum.tahun = muk.tahun AND mum.bulan = muk.bulan
    FULL JOIN latest_uang_sekarang lus ON mum.tahun = lus.tahun AND mum.bulan = lus.bulan
ORDER BY
    tahun, bulan;

    `;

    if (validasiUUID) {
      const { rows } = await pool.query(queryText, [access_id]);
      if (rows) {
        return rows;
      } else {
        throw new Error("Failed to fetch data to database");
      }
    } else {
      throw new Error("Your data is not valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

module.exports = {
  GetDompetAuthDB,
  UpdateDompetAuthDB,
  GetStatisticDompetDB,
};
