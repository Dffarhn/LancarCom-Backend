const { AskAiChat, formatReviews, getGroqSelectionReview } = require("../function/AIchat");
const { transformData, formatDevelopmentProgress } = require("../function/DataAI");
const { GetSpesificDaerahDB } = require("../model/AccessId");
const { GetTheChild, AddRekomendasiToDB, GetRekomendasiAItoDB, GetSpesificRekomendasiAItoDB } = require("../model/AskAI");
const { SearchUserForAccessIdDB, GetStatisticAllMonthDataKeuanganToDB } = require("../model/DataKeuanganModel");
const { GetStatisticDompetDB } = require("../model/DompetAuth");
const { GetPostFromAccessId } = require("../model/Post");
const { GetAllProgressPembangunanToDB } = require("../model/ProgressPembangunan");
const { GetAllRekomendasiAIForSpesificCity } = require("../model/RekomendasiAI");

const ChatAiRoute = async (req, res) => {
  try {
    const userId = req.user.id;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { access_id } = user[0];

    const { pesan } = req.body;

    const GetDataAboutCity = await GetPostFromAccessId([access_id]);
    console.log(GetDataAboutCity);

    const GetAllRekomendasiBefore = await GetAllRekomendasiAIForSpesificCity(access_id);
    const GetDataHistoryFinancial = await GetStatisticDompetDB(access_id);
    const RekomendasiBefore = GetAllRekomendasiBefore.map((item) => {
      return item.rekomendasi_ai;
    });

    console.log(RekomendasiBefore);

    const data = {
      nama_daerah: GetDataAboutCity[0].nama_daerah,
      pesan: pesan,
      FinancialHistory: transformData(GetDataHistoryFinancial),
      review: formatReviews(GetDataAboutCity[0].reviews),
      rekomendasi_before: formatReviews(RekomendasiBefore),
    };

    const BalasanAi = await AskAiChat(data, "chat");
    res.status(200).send({ msg: "Query Successful", data: BalasanAi });
  } catch (error) {
    res.status(500).json({ message: `${error.message}` });
  }
};

const AskAIRoute = async (req, res) => {
  try {
    const { tipe } = req.query;
    const userId = req.user.id;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { access_id } = user[0];
    const getChildFromAccessId = await GetTheChild(access_id);

    if (!getChildFromAccessId) {
      return res.status(500).send({ msg: "Failed to fetch data child" });
    }

    const idArray = getChildFromAccessId.map((item) => item.id);

    const idArrayKeuangan = getChildFromAccessId.map((item) => {
      return {
        id: item.id,
        asal_daerah: item.asal_daerah,
      };
    });

    // console.log(idArrayKeuangan);

    if (tipe == "Keuangan") {
      const ToAI = await Promise.all(
        idArrayKeuangan.map(async (item, index) => {
          await new Promise((resolve) => setTimeout(resolve, index * 5000));

          const GetDataHistoryFinancial = await GetStatisticDompetDB(item.id);

          const GetDataHistoryPembangunan = await GetAllProgressPembangunanToDB(item.id);

          // console.log(GetDataHistoryFinancial);
          // console.log(GetDataHistoryPembangunan);

          const data = {
            City: item.asal_daerah,
            FinancialHistory: transformData(GetDataHistoryFinancial),
            DevelopmentProgress: formatDevelopmentProgress(GetDataHistoryPembangunan),
          };

          const AskAI = await AskAiChat(
            `City Name: ${data.City} \n 
          Financial History for ${data.City}: ${data.FinancialHistory} 

         \n

          Development Progress for  ${data.City} : ${data.DevelopmentProgress}
          
          
          \n Give Your Analyze about this city from the Financial History and Development Progress that u  get, 
          i please do honestly explain in bahasa indonesia and must output with your output formatted`,
            "generate",
            "keuangan"
          );
          console.log(AskAI);
          const dataDB = {
            id: item.id,
            nama_daerah: data.City,
            rekomendasi_ai: AskAI,
            tipe: "Keuangan",
          };

          const AddDataToDB = await AddRekomendasiToDB(dataDB);
          return {
            id: item.id,
            nama_daerah: data.City,
            rekomendasi_ai: AskAI,
          };
        })
      );

      res.status(200).send({ msg: "Query Successful", data: ToAI });
    } else {
      const GetPostEachidArray = await GetPostFromAccessId(idArray);

      // Wait for all the promises to resolve
      const ToAI = await Promise.all(
        GetPostEachidArray.map(async (post, index) => {
          await new Promise((resolve) => setTimeout(resolve, index * 3000)); // 3 seconds delay

          const GetDataHistoryPembangunan = await GetAllProgressPembangunanToDB(post.id);
          const DevelopmentProgressFilter = formatDevelopmentProgress(GetDataHistoryPembangunan);
          const FilterReview = await getGroqSelectionReview(formatReviews(post.reviews));
          const AskAI = await AskAiChat(
            `City Name: ${post.nama_daerah} \n Review for ${post.nama_daerah}: ${FilterReview}
           \n Development Progress ${post.nama_daerah}: ${DevelopmentProgressFilter}
            Give Your Analyze about this city from the review and Development Progress that u have get, i please do honestly explain in bahasa indonesia and must output with your output formatted`,
            "generate",
            "pembangunan"
          );

          const dataDB = {
            id: post.id,
            nama_daerah: post.nama_daerah,
            rekomendasi_ai: AskAI,
            tipe: "Pembangunan",
          };

          const AddDataToDB = await AddRekomendasiToDB(dataDB);

          return {
            id: post.id,
            nama_daerah: post.nama_daerah,
            rekomendasi_ai: AskAI,
          };
        })
      );

      res.status(200).send({ msg: "Query Successful", data: ToAI });
    }
  } catch (error) {
    res.status(500).json({ message: `${error.message}` });
  }
};
const AskSpesificAIRoute = async (req, res) => {
  try {
    const { tipe } = req.query;
    const { id } = req.params;
    const userId = req.user.id;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const idArray = [id];

    const GetAsalDaerah = await GetSpesificDaerahDB(id);
    // console.log(GetAsalDaerah)

    const idArrayKeuangan = [
      {
        id: id,
        asal_daerah: GetAsalDaerah.asal_daerah,
      },
    ];

    // console.log(idArrayKeuangan);

    if (tipe == "Keuangan") {
      const ToAI = await Promise.all(
        idArrayKeuangan.map(async (item, index) => {
          await new Promise((resolve) => setTimeout(resolve, index * 5000));

          const GetDataHistoryFinancial = await GetStatisticDompetDB(item.id);

          const GetDataHistoryPembangunan = await GetAllProgressPembangunanToDB(item.id);

          const data = {
            City: item.asal_daerah,
            FinancialHistory: transformData(GetDataHistoryFinancial),
            DevelopmentProgress: formatDevelopmentProgress(GetDataHistoryPembangunan),
          };

          const AskAI = await AskAiChat(
            `City Name: ${data.City} \n 
          Financial History for ${data.City}: ${data.FinancialHistory} 

         \n

          Development Progress for  ${data.City} : ${data.DevelopmentProgress}
          
          
          \n Give Your Analyze about this city from the Financial History and Development Progress that u  get, i please do honestly explain in bahasa indonesia and must output with your output formatted`,
            "generate",
            "keuangan"
          );
          console.log(AskAI);
          const dataDB = {
            id: item.id,
            nama_daerah: data.City,
            rekomendasi_ai: AskAI,
            tipe: "Keuangan",
          };

          const AddDataToDB = await AddRekomendasiToDB(dataDB);
          return {
            id: item.id,
            nama_daerah: data.City,
            rekomendasi_ai: AskAI,
          };
        })
      );

      res.status(200).send({ msg: "Query Successful", data: ToAI });
    } else {
      const GetPostEachidArray = await GetPostFromAccessId(idArray);

      // Wait for all the promises to resolve
      const ToAI = await Promise.all(
        GetPostEachidArray.map(async (post, index) => {
          await new Promise((resolve) => setTimeout(resolve, index * 3000)); // 2 seconds delay
          const GetDataHistoryPembangunan = await GetAllProgressPembangunanToDB(post.id);
          const DevelopmentProgressFilter = formatDevelopmentProgress(GetDataHistoryPembangunan);
          const FilterReview = await getGroqSelectionReview(formatReviews(post.reviews));
          const AskAI = await AskAiChat(
            `City Name: ${post.nama_daerah} \n Review for ${post.nama_daerah}: ${FilterReview}
           \n Development Progress ${post.nama_daerah}: ${DevelopmentProgressFilter}
            Give Your Analyze about this city from the review and Development Progress that u have get, i please do honestly explain in bahasa indonesia and must output with your output formatted`,
            "generate",
            "pembangunan"
          );

          const dataDB = {
            id: post.id,
            nama_daerah: post.nama_daerah,
            rekomendasi_ai: AskAI,
            tipe: "Pembangunan",
          };

          const AddDataToDB = await AddRekomendasiToDB(dataDB);

          return {
            id: post.id,
            nama_daerah: post.nama_daerah,
            rekomendasi_ai: AskAI,
          };
        })
      );

      res.status(200).send({ msg: "Query Successful", data: ToAI });
    }
  } catch (error) {
    res.status(500).json({ message: `${error.message}` });
  }
};

const getAllRekomendasi = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const tipe = req.query.type || "Keuangan";
    const searchQuery = req.query.search || ""; // Add search query parameter

    const userId = req.user.id;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { access_id } = user[0];

    // Fetch the total data count for pagination
    const getChildFromAccessId = await GetTheChild(access_id);
    if (!getChildFromAccessId) {
      return res.status(500).send({ msg: "Failed to fetch data child" });
    }

    const theChild = getChildFromAccessId.map((item) => {
      return item.id;
    });
    const totalDataCount = theChild.length - 1;

    const GetDataRekomendasiToDB = await GetRekomendasiAItoDB(theChild, limit, offset, tipe, searchQuery); // Pass search query

    if (GetDataRekomendasiToDB) {
      res.status(200).send({
        msg: "Query Successfully",
        data: GetDataRekomendasiToDB,
        currentPage: page,
        totalPages: Math.ceil(totalDataCount / limit),
      });
    } else {
      res.status(500).send({ msg: "Error to fetch database" });
    }
  } catch (error) {
    res.status(500).json({ message: `${error.message}` });
  }
};

const getSpesificRekomendasi = async (req, res) => {
  try {
    const tipe = req.query.type || "Keuangan";

    const userId = req.user.id;
    // Use the user ID to fetch user details from the database
    const user = await SearchUserForAccessIdDB(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const access_id = req.params.id;

    const GetDataRekomendasiToDB = await GetSpesificRekomendasiAItoDB(access_id, tipe);

    if (GetDataRekomendasiToDB) {
      res.status(200).send({
        msg: "Query Successfully",
        data: GetDataRekomendasiToDB,
      });
    } else {
      res.status(500).send({ msg: "error to fetch database" });
    }
  } catch (error) {
    res.status(500).json({ message: `${error.message}` });
  }
};

module.exports = { AskAIRoute, getAllRekomendasi, ChatAiRoute, getSpesificRekomendasi, AskSpesificAIRoute };
