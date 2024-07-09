const axios = require('axios');
const cheerio = require('cheerio'); // For parsing HTML (install using npm install cheerio)
const fs = require('fs');

// Function to fetch all submission details
async function fetchSubmissions(username) {
  let page = 1;
  let totalPages = 1; // Start with 1 page by default
  let allSubmissions = [];

  // Request configuration with headers
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://codeforces.com/submissions/${username}/page/${page}`,
   
  };

  // Fetch submissions until all pages are processed
  while (page <= totalPages) {
    config.url = `https://codeforces.com/submissions/${username}/page/${page}`;
    try {
      const response = await axios.request(config);

      // Use cheerio to parse HTML and extract submission details
      const $ = cheerio.load(response.data);
      const submissions = [];

      $('tr[data-submission-id]').each((index, element) => {
        const submissionId = $(element).attr('data-submission-id');
        const contestId = extractContestId($(element));
        const submissionUrl = `https://codeforces.com/contest/${contestId}/submission/${submissionId}`;
        const verdict = $(element).find('td').eq(5).text().trim();

        // Extract contest ID from the submission page
        submissions.push({
          submissionUrl,
          contestId: contestId,
          verdict: verdict
        });
      });

      allSubmissions = allSubmissions.concat(submissions);

      // Extract total number of pages from the pagination control
      const lastPage = $('.pagination').find('.page-index').last().text();
      totalPages = parseInt(lastPage) || 1; // Fallback to 1 if lastPage is not a number

      console.log(`Fetched page ${page}/${totalPages}`);

      page++;
    } catch (error) {
      console.error(`Error fetching page ${page}: ${error.message}`);
      break; // Exit loop on error
    }
  }

  return { submissions: allSubmissions, totalPages };
}

// Function to extract contest ID from submission row element
function extractContestId($element) {
  // Assuming the contest ID is part of the submission row URL
  const submissionUrl = $element.find('td').eq(3).find('a').attr('href');
  const contestIdMatch = submissionUrl.match(/contest\/(\d+)/);
  if (contestIdMatch) {
    return contestIdMatch[1];
  } else {
    return null;
  }
}

// Function to fetch submissions for multiple users and generate the required output
async function fetchSubmissionsForUsers(usernames) {
  let results = [];
  
  for (const username of usernames) {
    const { submissions } = await fetchSubmissions(username);
    const uniqueContests = [...new Set(submissions
      .filter(submission => submission.verdict === 'skipped')
      .map(submission => submission.contestId)
    )];
    results.push({
      userName: username,
      contests: uniqueContests
    });
  }
  
  return results;
}

// Function to save results to a file
async function saveResultsToFile(results, filename) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, JSON.stringify(results, null, 2), (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

// Usage example
const usernames = [  "ayushk22", "Tushars_07", "Maurya30", "TheReal_Slim", "roronoa_2z",
  "mainak13", "KartevSumit", "meetjpatel017", "noAnya", "keshav_.agg",
  "akkshit_19", "dp177", "kartik308", "_kushagragarg", "kritic1329",
  "Keshav_Laddha", "shantanu1283", "Bitan_09", "anuragtomar10", "LycanAlan",
  "jeenius69", "Mg718", "vedrathavi", "big_foot05", "aniketaslaliya",
  "Boltghostkartik", "Pubby_2005", "gagan20042004", "Kavish_Jain19", "SOHAM160",
  "KSHDIXIT", "Um_dj", "blackswan_23", "mavik10", "HARDIKJAIN1632",
  "nileshgoyal_14", "amanjaiswal07", "Quiron-200", "harshitajain512", "shivam_codes",
  "Raghav1234", "fxhxdxd", "dev_moulik", "UjjwaL_011", "Reaper171",
  "Nikhil_codes274", "its_Pegasus", "Spookyyy", "bd_123", "Cipher_Sculptor",
  "MuditChoudhary", "idontknowaditya", "udaysharma24", "Sabhay02", "LUCIFER785",
  "himanshi_49", "Shubham_3017", "Harshitaaa", "Khushiiee21", "manye03",
  "agarwaladitya", "Gearz", "Abhi_d_gr8", "siddharthsolankidecember", "Shivvv24122004123",
  "_Pranjal_jain_2005", "AXE08", "Packunter", "TunTunMausii", "AVI017", "Captain_Levi_1",
  "NamanKhandelwal1607", "riddhika707", "pranavkhunt6905", "AlakshendraB", "Animesh_4",
  "Piri.Piri", "23ucc566", "TanmayKH", "TheFrenchiestFry", "Ankit_Giri_8", "paramveer5404",
  "Ayush_Negi", "Jatin_jain", "WORTH", "synthborne", "AloneMusk", "crimsonred",
  "Nitin1605", "og_", "Gminor", "KINGZIE", "killer4585654", "AG___", "_SwaRaj",
  "Gsharp", "VaibhavRai10", "utk.", "NamanJ_1", "ModernSudama", "pranshul_047",
  "HD2003", "Devanshu-Sharma", "rameshdange5191", "Suyash_R10", "code_tal",
  "adarsh_251", "TarunAga", "Darthforces", "RJ07", "dcode2004", "euphoria09",
  "Panda_codes", "aishwarykesarwani", "Punpun018", "RahulHarpal", "Tushar444",
  "Pranjal_Jain2310", "aayush249", "Krutish_Raval", "Piri.Piri", "TunTunMausii",
  "noAnya", "Sarthak_Dengre", "Vishrut_Panya", "ansul_18", "Vedant_182004",
  "HardikMakkar", "meetjpatel017", "RizTrey", "dp177", "akshay0001", "keshav15104",
  "AyushMiglani", "sudipjana048", "err0r_4O3", "burhan_vora", "ByteMeDude",
  "vanshrl9ine", "hecker_7740", "De1m0S", "Tushar_ag08", "devansh19", "lord_of_crime",
  "Vedant-Baldwa", "priynashu.sharma2612", "Harsh_Koringa_", "aniketaslaliya",
  "conturna", "diya_ghodasara", "Shivvv24122004123", "blackswan_23", "Aadi2316",
  "shaharyan729", "Keshav_950", "harshtailor8696", "anukuljain42", "MohitAgrawal32",
  "sheesh2", "Ishhhh", "guptasankalp2004", "Captain_Levi_1", "divyanshi_agarwal",
  "hey_dev.ag", "_ea_e_", "jainarchit529", "AUSM1526", "Maitreyee_Kulkarni", "Mg718",
  "Adi_Rocks001", "Um_dj", "Spookyyy", "flicktoss", "Arnay", "shreyanshdangi464",
  "Harshvardhan10092004", "Harita_paliwal", "nit.nitish02", "vedicgoyal", "vyom2022",
  "ashika_verma_", "tushar_1012", "22ucc038", "DEV_KHUBANI", "AARAVsharma", "harshitaa18",
  "MinalAgrawal", "Saubhagya234" ]; // Replace with the desired usernames

fetchSubmissionsForUsers(usernames)
  .then(results => {
    console.log('Results:');
    console.log(results);
    return saveResultsToFile(results, 'usrs.json');
  })
  .then(() => {
    console.log('Results saved to usrs.json');
  })
  .catch((error) => {
    console.error('Error fetching submissions for users:', error);
  });
