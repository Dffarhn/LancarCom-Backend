const pool = require("../../db_connect");
const { validatorUUID } = require("../function/Validator");
const { UpdateDompetAuthDB } = require("./DompetAuth");

async function getAlurKeuangan(id) {
  try {
    const idAlur = validatorUUID(id);

    if (!idAlur) {
      throw new Error("ur id is not valid");
    }

    const queryValues = [id];

    const queryText = `SELECT * FROM data_keuangan where id = $1`;

    const { rows } = await pool.query(queryText, queryValues);

    if (rows.length === 0) {
      throw new Error("U Dont Have Any Alur Keuangan ID");
    }

    return rows;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function SearchUserForAccessIdDB(id) {
  try {
    const queryValues = [id];
    const queryText = `

    SELECT *
    FROM public.userdb
    JOIN public.access_id ON public.userdb.access_id = public.access_id.id
    WHERE public.userdb.id = $1;
    
        
        `;

    const { rows } = await pool.query(queryText, queryValues);

    return rows;
  } catch (error) {
    throw new Error(`Failed to search user : ${error.message}`);
  }
}

async function AddAlurKeuanganDB(data, user) {
  try {
    const { penerima, uang_turunan } = data;

    const { access_id, role } = user;

    const pemberi = access_id;
    const category = role;
    const status = "pending";
    const tgl_turunan = new Date();

    const queryValues = [penerima, pemberi, uang_turunan, tgl_turunan, status, category];

    const queryText = `
        INSERT INTO public.data_keuangan(
            penerima, pemberi, uang_turunan, tgl_turunan, status, category)
            VALUES ($1,$2,$3,$4,$5,$6);

            RETURNING id
        
        `;

    const { rows } = await pool.query(queryText, queryValues);

    return rows;
  } catch (error) {
    throw new Error(`Failed to add alur keuangan : ${error.message}`);
  }
}

async function VerifyAlurKeuanganDB(data, user) {
  try {
    const { uang_diterima, id } = data;

    const { access_id } = user;

    const penerima = access_id;

    const AlurKeuangandetail = await getAlurKeuangan(id);

    let status = "success";
    if (uang_diterima != AlurKeuangandetail[0].uang_turunan) {
      status = "investigasi";
    }

    if (penerima != AlurKeuangandetail[0].penerima) {
      throw new Error("Wrong Recipient");
    }
    const tgl_diterima = new Date();

    const queryValues = [uang_diterima, tgl_diterima, status, id];

    const queryText = `
    UPDATE public.data_keuangan
    SET
        uang_diterima = $1,
        tgl_diterima = $2,
        status = $3
    WHERE
        id = $4
    RETURNING id,uang_diterima;
`;

    const { rows } = await pool.query(queryText, queryValues);

    const dataUpdateDompet = {
      access_id: access_id,
      uang_masuk: rows[0].uang_diterima,
      tanggal_update: new Date(),
    };

    await UpdateDompetAuthDB(dataUpdateDompet);

    return rows;
  } catch (error) {
    throw new Error(`Failed to add alur keuangan : ${error.message}`);
  }
}

async function GetTotalDataCount(access_id) {
  try {
    const validasiUUID = validatorUUID(access_id);
    const countQuery = `
      SELECT COUNT(*)
      FROM data_keuangan dk
      WHERE dk.pemberi = $1;
    `;

    if (validasiUUID) {
      const { rows } = await pool.query(countQuery, [access_id]);
      return { count: parseInt(rows[0].count) };
    } else {
      throw new Error("Your Data is not valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}
async function GetTotalDataPenerimaCount(access_id) {
  try {
    const validasiUUID = validatorUUID(access_id);
    const countQuery = `
      SELECT COUNT(*)
      FROM data_keuangan dk
      WHERE dk.penerima = $1;
    `;

    if (validasiUUID) {
      const { rows } = await pool.query(countQuery, [access_id]);
      return { count: parseInt(rows[0].count) };
    } else {
      throw new Error("Your Data is not valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function GetAllDataKeuanganToDB(access_id, limit, offset,searchQuery) {
  try {
    const validasiUUID = validatorUUID(access_id);
    const queryText = `
      SELECT dk.*, 
        penerima_access.asal_daerah AS penerima_name, 
        pemberi_access.asal_daerah AS pemberi_name
      FROM data_keuangan dk
      JOIN access_id penerima_access ON dk.penerima = penerima_access.id
      JOIN access_id pemberi_access ON dk.pemberi = pemberi_access.id
      WHERE dk.pemberi = $1 
      AND penerima_access.asal_daerah LIKE '%${searchQuery}%'
      LIMIT $2 OFFSET $3;
    `;

    if (validasiUUID) {
      const { rows } = await pool.query(queryText, [access_id, limit, offset]);

      if (rows) {
        return rows;
      } else {
        throw new Error("Failed to fetch from database");
      }
    } else {
      throw new Error("Your Data is not valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function GetAllDataKeuanganToDBPenerima(access_id, limit, offset) {
  try {
    const validasiUUID = validatorUUID(access_id);
    const queryText = `
      SELECT dk.*, 
            penerima_access.asal_daerah AS penerima_name, 
            pemberi_access.asal_daerah AS pemberi_name
      FROM data_keuangan dk
      JOIN access_id penerima_access ON dk.penerima = penerima_access.id
      JOIN access_id pemberi_access ON dk.pemberi = pemberi_access.id
      WHERE dk.penerima = $1
      LIMIT $2 OFFSET $3;
    `;

    if (validasiUUID) {
      const { rows } = await pool.query(queryText, [access_id, limit, offset]);

      if (rows) {
        return rows;
      } else {
        throw new Error("failed to fetch database");
      }
    } else {
      throw new Error("Your Data Is not Valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}
async function GetDataKeuanganToDB(access_id, id) {
  try {
    const validasiUUID = validatorUUID(access_id);
    console.log(id);
    const queryText = `
      SELECT dk.*, 
            penerima_access.asal_daerah AS penerima_name, 
            pemberi_access.asal_daerah AS pemberi_name
      FROM data_keuangan dk
      JOIN access_id penerima_access ON dk.penerima = penerima_access.id
      JOIN access_id pemberi_access ON dk.pemberi = pemberi_access.id
      WHERE dk.pemberi = $1 AND dk.id = $2;
    `;

    if (validasiUUID) {
      const { rows } = await pool.query(queryText, [access_id, id]);

      if (rows) {
        return rows;
      } else {
        throw new Error("failed to fetch database");
      }
    } else {
      throw new Error("Your Data Is not Valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function GetDataKeuanganToDBPenerima(access_id, id) {
  try {
    const validasiUUID = validatorUUID(access_id);
    console.log(id);
    const queryText = `
      SELECT dk.*, 
            penerima_access.asal_daerah AS penerima_name, 
            pemberi_access.asal_daerah AS pemberi_name
      FROM data_keuangan dk
      JOIN access_id penerima_access ON dk.penerima = penerima_access.id
      JOIN access_id pemberi_access ON dk.pemberi = pemberi_access.id
      WHERE dk.penerima = $1 AND dk.id = $2;
    `;

    if (validasiUUID) {
      const { rows } = await pool.query(queryText, [access_id, id]);

      if (rows) {
        return rows;
      } else {
        throw new Error("failed to fetch database");
      }
    } else {
      throw new Error("Your Data Is not Valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}
async function GetStatisticAllDataKeuanganToDB(access_id, query) {
  try {
    const validasiUUID = validatorUUID(access_id);

    const { month, year } = query;

    console.log(month, year);
    const queryText = `
    WITH grouped_data AS (
    SELECT
        EXTRACT(YEAR FROM tgl_turunan) AS year,
        EXTRACT(MONTH FROM tgl_turunan) AS month,
        status,
        COUNT(*) AS count
    FROM
        data_keuangan
    WHERE
        pemberi = $1
        AND EXTRACT(YEAR FROM tgl_turunan) = $3
        AND EXTRACT(MONTH FROM tgl_turunan) = $2
    GROUP BY
        year, month, status
    )
    SELECT
        year,
        month,
        json_agg(json_build_object('status', status, 'count', count)) AS statuses
    FROM
        grouped_data
    GROUP BY
        year, month
    ORDER BY
        year, month;

    `;

    if (validasiUUID) {
      const { rows } = await pool.query(queryText, [access_id, month, year]);

      if (rows) {
        return rows;
      } else {
        throw new Error("failed to fetch database");
      }
    } else {
      throw new Error("Your Data Is not Valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}
async function GetStatisticAllMonthDataKeuanganToDB(access_id) {
  try {
    const validasiUUID = validatorUUID(access_id);
    const queryText = `
WITH grouped_data AS (
    SELECT
        EXTRACT(YEAR FROM tgl_turunan) AS year,
        EXTRACT(MONTH FROM tgl_turunan) AS month
    FROM
        data_keuangan
    WHERE
        pemberi = $1
    GROUP BY
        year, month
)
SELECT
    year,
    month
FROM
    grouped_data
ORDER BY
    year DESC, month DESC;

    `;

    if (validasiUUID) {
      const { rows } = await pool.query(queryText, [access_id]);

      if (rows) {
        return rows;
      } else {
        throw new Error("failed to fetch database");
      }
    } else {
      throw new Error("Your Data Is not Valid");
    }
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

module.exports = {
  SearchUserForAccessIdDB,
  AddAlurKeuanganDB,
  VerifyAlurKeuanganDB,
  GetAllDataKeuanganToDB,
  GetStatisticAllDataKeuanganToDB,
  GetAllDataKeuanganToDBPenerima,
  GetDataKeuanganToDB,
  GetDataKeuanganToDBPenerima,
  GetStatisticAllMonthDataKeuanganToDB,
  GetTotalDataCount,
  GetTotalDataPenerimaCount,
};
