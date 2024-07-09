const axios = require('axios');
const fs = require('fs');

async function getUserData(handle) {
    try {
        const url = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching data for ${handle}: ${error.message}`);
        return null;
    }
}

function processUserData(data) {
    if (data && data.status === 'OK') {
        const contests = {};
        data.result.forEach(submission => {
            if (!contests[submission.contestId]) {
                contests[submission.contestId] = {
                    contestId: submission.contestId,
                    submissions: [],
                    hasSkipped: false
                };
            }
            contests[submission.contestId].submissions.push({
                submissionId: submission.id,
                verdict: submission.verdict,
                time: submission.creationTimeSeconds
            });
            if (submission.verdict === 'SKIPPED') {
                contests[submission.contestId].hasSkipped = true;
            }
        });

        return Object.values(contests)
            .filter(contest => contest.hasSkipped)
            .map(({ contestId, submissions }) => ({ contestId, submissions }));
    }
    return [];
}

async function main() {
    const users = [
      "ayushk22", "Tushars_07", "Maurya30", "TheReal_Slim", "roronoa_2z",
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
      "Gsharp", "VaibhavRai10", ".utk.", "NamanJ_1", "ModernSudama", "pranshul_047",
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
      "MinalAgrawal", "Saubhagya234", "_xorrr", "Hemant297", "adityakhadekar7",
      "KartevSumit", "TunTunMausii", "Piri.Piri", "Sarthak_Dengre",
      "CODER_KALA", "amanjaiswal07", "shivam_codes", "Spookyyy",
      "Saviturchauhan21", "Gaur_Sahaab", "codebreaker12", "akk_026",
      "Anshika_a", "rishika_parashar", "vinitsikri"
  ];

    const results = [];

    for (const user of users) {
        const userData = await getUserData(user);
        if (userData) {
            const skippedContests = processUserData(userData);
            results.push({ userID: user, skippedContests });
        }
    }

    fs.writeFileSync('users.json', JSON.stringify(results, null, 2));
    console.log('Data has been written to users.json');
}

main().catch(console.error);