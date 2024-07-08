const { Router } = require("express");

const { RegisterUser, LoginUser } = require("./UserRoute");
const { GetDompet, GetStatisticDompet } = require("./DompetAuth");
const { Auth_Access } = require("../middleware/AccessRoute");
const { AddAlurKeuangan, VerifyAlurKeuangan, GetAllDataKeuangan, GetStatisticAllDataKeuangan, GetAllDataKeuanganPenerima, GetDataKeuangan, GetDataKeuanganPenerima, GetStatisticAllMonthDataKeuangan } = require("./DataKeuanganAuth");
const { GetAllDaerahAccessId, AddRequestAccessId } = require("./AccessIdRoute");
const { AddReviewUser, GetReviewUser } = require("./ReviewRoute");
const { AddPostUser } = require("./PostRoute");
const { GetAllPembangunan, GetPembangunan, AddPembangunan, UpdatePembangunan, GetStatisticAllPembangunan } = require("./PembangunansRoute");
const { getProgressPembangunan, getAllProgressPembangunan, AddProgressPembangunan } = require("./ProgressPembangunanRoute");
const { AskAIRoute, getAllRekomendasi, ChatAiRoute, getSpesificRekomendasi, AskSpesificAIRoute } = require("./AskAIRoute");
const { SendRekomendasiRoute, GetAllRekomendasiRoute, GetSpesificRekomendasiRoute } = require("./Inbox");
const route = Router();

route.get("/", (req, res) => {
  res.send("halo world");
});

route.post("/login", LoginUser);

route.post("/register", RegisterUser);

//endpoint for dompet
route.get("/dompet", Auth_Access, GetDompet);
route.get("/statistic/dompet", Auth_Access, GetStatisticDompet);
// route.patch("/dompet/:access_id")

//request access id for user government
route.get("/access_id/daerah", GetAllDaerahAccessId);
route.post("/request/access_id", Auth_Access, AddRequestAccessId);

//post data_keuangan
route.get("/data/pemberi/keuangans", Auth_Access, GetAllDataKeuangan);
route.get("/data/pemberi/keuangan/:id", Auth_Access, GetDataKeuangan);
route.get("/data/penerima/keuangans", Auth_Access, GetAllDataKeuanganPenerima);
route.get("/data/penerima/keuangan/:id", Auth_Access, GetDataKeuanganPenerima);

route.get("/statistic/keuangans", Auth_Access, GetStatisticAllDataKeuangan);

route.get("/statistic/keuangans/month", Auth_Access, GetStatisticAllMonthDataKeuangan);

route.post("/add/alur/keuangan", Auth_Access, AddAlurKeuangan);
route.patch("/verify/alur/keuangan/:id", Auth_Access, VerifyAlurKeuangan);

//Pembangunans
route.get("/pembangunans/", Auth_Access, GetAllPembangunan);
route.get("/pembangunan/:pembangunan_id", Auth_Access, GetPembangunan);

route.post("/pembangunan", Auth_Access, AddPembangunan);
route.patch("/pembangunan/:pembangunan_id", Auth_Access, UpdatePembangunan);

route.get("/statistic/pembangunan",Auth_Access, GetStatisticAllPembangunan )

//Review User
route.get("/review", Auth_Access, GetReviewUser);
route.post("/review", Auth_Access, AddReviewUser);

//Post User
route.post("/post", Auth_Access, AddPostUser);

//Progress_Pembangunan
route.get("/progres/pembangunans", Auth_Access, getAllProgressPembangunan);
route.get("/progres/pembangunan/:id", Auth_Access, getProgressPembangunan);
route.post("/progres/pembangunan/:pembangunan_id", Auth_Access, AddProgressPembangunan);

//AI ROUTE
route.post("/askAi", Auth_Access, AskAIRoute);

route.post("/askAi/:id", Auth_Access, AskSpesificAIRoute);

//REKOMENDASI AI

route.get("/rekomendasiAI", Auth_Access, getAllRekomendasi);
route.get("/rekomendasiAI/:id", Auth_Access, getSpesificRekomendasi);

route.post("/ChatAI", Auth_Access, ChatAiRoute);


//Inbox

route.post("/send/rekomendasiAI",Auth_Access,SendRekomendasiRoute)
route.get("/inbox",Auth_Access,GetAllRekomendasiRoute)
route.get("/inbox/message/:id",Auth_Access,GetSpesificRekomendasiRoute)

module.exports = { route };
