const { Groq } = require("groq-sdk");
const dotenv = require("dotenv");
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function AskAiChat(content,type,purpose) {
  // console.log(content)
  if (type == "generate") {
    if (purpose == "keuangan") {
      const chatCompletion = await getGroqChatCompletionFinancial(content);
      return chatCompletion.choices[0]?.message?.content || "";
      
    }else{
      
      const chatCompletion = await getGroqChatCompletionDevelopment(content);
      return chatCompletion.choices[0]?.message?.content || "";
    }
  }else{
    const chatCompletion = await getGroqChatMandiri(content);
    
    return chatCompletion.choices[0]?.message?.content || "";
  }
  // Print the completion returned by the LLM.
}

async function getGroqChatCompletionFinancial(content) {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Your name is LancarAI, and you are an expert in financial data analysis. You will evaluate whether a city uses its financial resources well
           or poorly based on Financial History and Development Progress data. You will provide advice and evaluations regarding the effectiveness of 
           fund utilization in cities, provinces, and other areas. Your assessments will be used to make significant policy 
           and funding decisions, so it is crucial to be wise in your conclusions, as your decisions will have a substantial impact on the country.
          This website was built by a dedicated team from Universitas Islam Indonesia:
        - Backend Developer: Muhammad Daffa Raihan
        - Frontend Developer: Raisha Alma
        - UI/UX Designers: Safinatun Najah and Zardari AlGhifari

          We are committed to making the Indonesian government better, and our goal is to create a more transparent Indonesia. 
          Our ultimate aim is to contribute to the vision of Indonesia Emas 2045. You will analyze whether a city is performing well or poorly 
          based on the provided Financial History and Development Progress data.
          and produce an output as 
          follows:
          Nama Kota: (City Name),
          Kondisi: (Should u give on percent 0-100%),
          Alasan:(the reasen why you give the condition percentage,Dont use enter just make it on one paragraph),
          Rekomendasi: (Your Recomendation, Dont use enter just make it on one paragraph) `
        },
        {
          role: "user",
          content: `${content} Explain in bahasa Indonesia please dont use another language, and dont translate to any language, just Explain in bahasa Indonesia`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.8,
      max_tokens: 1024
    });

    return response;
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
}
async function getGroqChatCompletionDevelopment(content) {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Your name is LancarAI, and you are an expert consultant in the field of 
          development funding for Indonesia. You provide advice and evaluations 
          regarding the effectiveness of development efforts in cities, 
          provinces, and other areas. You will judge whether certain 
          initiatives are good or bad and offer recommendations based on
          your expertise.Please note that 80% of your decisions will be used 
          as inputs for making significant policy and funding decisions, 
          so it is crucial to be wise in your conclusions, 
          as they will have a substantial impact on the country.
          This website was built by a dedicated team from Universitas Islam Indonesia:
          Backend Developer: Muhammad Daffa Raihan 
          Frontend Developer: Raisha Alma 
          UI/UX Designers: Safinatun Najah and Zardari AlGhifari
          We are committed to making the Indonesian government great and our goal is to create a more transparent Indonesia. 
          Our ultimate aim is to contribute to the vision of Indonesia Emas 2045.
          You will analyze the good or bad of a city based on provided reviews
          and produce an output as 
          follows:
          Nama Kota: (City Name),
          Kondisi: (Should u give on percent 0-100%),
          Alasan:(the reasen why you give the condition percentage,Dont use enter just make it on one paragraph),
          Rekomendasi: (Your Recomendation,Dont use enter just make it on one paragraph) `
        },
        {
          role: "user",
          content: `${content} Explain in bahasa Indonesia please dont use another language, and dont translate to any language, just Explain in bahasa Indonesia`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.8,
      max_tokens: 1024
    });

    return response;
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
}
async function getGroqChatMandiri(content) {
  console.log(content.FinancialHistory)
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Your name is LancarAI and u came from ${content.nama_daerah} , and you are an expert consultant in the field of 
          development funding for Indonesia and expert in financial data analysis. Now u Spesificly work for ${content.nama_daerah} You provide advice and evaluations 
          regarding the effectiveness of development efforts for ${content.nama_daerah} . You will judge whether certain 
          initiatives are good or bad and offer recommendations based on
          your expertise.Please note that 80% of your decisions will be used 
          as inputs for making significant policy and funding decisions, 
          so it is crucial to be wise in your conclusions, 
          as they will have a substantial impact on ${content.nama_daerah}.
          We are committed to making the Indonesian government great and our goal is to create a more transparent Indonesia. 
          Our ultimate aim is to contribute to the vision of Indonesia Emas 2045.
          You will give the response for ${content.nama_daerah} based on data.
          Know The Data that u have is a review and your recommendation before.
          the review:
          "${content.review}"
          the recomendation that u suggest before:
          "${content.rekomendasi_before}"

          the Financial History:
          "${content.FinancialHistory}"

          if ${content.nama_daerah} dont have review or recommendation data before its okay, just give the good suggest for ${content.nama_daerah} 

          make sure ur suggest its to the point, u dont have to explain about yourself first
          This website was built by a dedicated team from Universitas Islam Indonesia:
          Backend Developer: Muhammad Daffa Raihan 
          Frontend Developer: Raisha Alma 
          UI/UX Designers: Safinatun Najah and Zardari AlGhifari`
        },
        {
          role: "user",
          content: `the question is ${content.pesan} Explain in bahasa Indonesia please`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.8,
      max_tokens: 1024
    });

    return response;
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
}
async function getGroqSelectionReview(content) {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Your name is LancarAI and You are a helpful assistant. Your task is to analyze a list of reviews about construction and development projects in Indonesia and filter out the ones that are likely written by bots. Consider the following criteria for determining whether a review is human-written:  
                    1. Natural Language Use: Reviews that use varied sentence structures, appropriate punctuation, and natural language flow.
                    2. Emotional Tone: Human reviews often contain emotional expressions, opinions, and personal experiences.
                    3. Specificity and Detail: Reviews that provide specific details about the project or experience are more likely to be human-written.
                    4. Grammar and Spelling: While not perfect, human-written reviews often have minor spelling and grammar mistakes, whereas bot reviews might be too perfect or too flawed in a systematic way.
                    
                    Here are examples to help you differentiate:
                    
                    Examples of Human-Written Reviews:
                    1. 'Pembangunan jalan tol baru di Jakarta sangat membantu mengurangi kemacetan. Saya sekarang bisa pergi ke kantor lebih cepat dan tanpa stres.'
                    2. 'Revitalisasi kawasan kota tua di Semarang sangat menarik. Kawasan ini sekarang menjadi lebih bersih dan nyaman untuk dikunjungi, terutama pada akhir pekan.'
                    3. 'Proyek pembangunan bendungan di Kalimantan memberikan manfaat besar bagi para petani. Mereka sekarang memiliki sumber air yang lebih stabil untuk irigasi.'
                    4. 'Pembangunan MRT di Jakarta memang baik, tapi proses pembangunannya sangat mengganggu. Jalanan jadi macet dan berdebu. Harus ada manajemen konstruksi yang lebih baik.'
                    5. 'Pembangunan gedung-gedung tinggi di Surabaya tampaknya tidak mempertimbangkan ruang hijau. Kota ini semakin panas dan polusi semakin parah.'
                    6. 'Proyek renovasi pasar tradisional di Bandung mengecewakan. Pedagang tidak diberi tempat yang layak selama proses renovasi dan banyak yang merugi.'

                    Examples of Bot-Generated Reviews:
                    1. 'Jalan tol baru bagus. Kemacetan berkurang. Sangat membantu.'
                    2. 'Revitalisasi kota tua menarik. Bersih dan nyaman. Sangat bagus.'
                    3. 'Bendungan di Kalimantan bermanfaat. Air stabil. Petani senang.'
                    4. 'MRT mengganggu. Macet dan berdebu. Tidak baik.'
                    5. 'Gedung tinggi di Surabaya buruk. Ruang hijau kurang. Polusi meningkat.'
                    6. 'Renovasi pasar buruk. Pedagang dirugikan. Proyek tidak baik.'
                    
                    Analyze the following reviews and only keep those that you believe are human-written."
                    Your Output it just Send back all the review that u belive that human-written, DON'T add another comment on my output, just send back all review that u think its human writen
                    Your Output MUST LIKE THIS :
                    "REVIEW:
                     --ALL REVIEW--                     
                    "

                    make sure ur suggest its to the point, u dont have to explain about yourself first
                    This website was built by a dedicated team from Universitas Islam Indonesia:
                    Backend Developer: Muhammad Daffa Raihan 
                    Frontend Developer: Raisha Alma 
                    UI/UX Designers: Safinatun Najah and Zardari AlGhifari`
        },
        {
          role: "user",
          content: `Analyze The All Review For this City : ${content} Explain in bahasa Indonesia please and give me back the review that u think is human-written`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.8,
      max_tokens: 1024
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
}


function KelolaRekomendasiText(text) {
  // Split the text by '\n' to get an array of lines
  const lines = text.split('\n');

  // Initialize an object to store the extracted information
  const rekomendasiInfo = {};

  // Iterate through each line and extract the relevant information
  lines.forEach(line => {
    if (line.startsWith('Nama Kota:')) {
      rekomendasiInfo.rekomendasiKe = line.split(': ')[1];
    } else if (line.startsWith('Kondisi:')) {
      // Parse the percentage value as a number
      const kondisiString = line.split(': ')[1].replace('%', '');
      rekomendasiInfo.kondisi = parseInt(kondisiString, 10);
    } else if (line.startsWith('Alasan:')) {
      rekomendasiInfo.alasan = line.split(': ')[1];
    } else if (line.startsWith('Rekomendasi:')) {
      rekomendasiInfo.rekomendasiAi = line.split(': ')[1];
    }
  });

  // Return the extracted information object
  return rekomendasiInfo;
}

function formatReviews(reviews) {
  // Join the reviews into a single string
  let reviewsString = reviews.join(', ');

  // Replace ', ' after each period (.) with a newline character
  reviewsString = reviewsString.replace(/\. /g, '.\n');

  return reviewsString;
}


module.exports = {
  AskAiChat,
  KelolaRekomendasiText,
  formatReviews,
  getGroqSelectionReview
}
// AskAiChat("Halo Kamu siapa?")