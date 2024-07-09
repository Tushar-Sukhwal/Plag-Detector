const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

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
  if (data && data.status === "OK") {
    const contests = {};
    data.result.forEach((submission) => {
      if (!contests[submission.contestId]) {
        contests[submission.contestId] = {
          contestId: submission.contestId,
          submissions: [],
          hasSkipped: false,
        };
      }
      contests[submission.contestId].submissions.push({
        submissionId: submission.id,
        verdict: submission.verdict,
        time: submission.creationTimeSeconds,
      });
      if (submission.verdict === "SKIPPED") {
        contests[submission.contestId].hasSkipped = true;
      }
    });

    return Object.values(contests)
      .filter((contest) => contest.hasSkipped)
      .map(({ contestId, submissions }) => ({ contestId, submissions }));
  }
  return [];
}

async function getUsersData(users) {
  const results = [];

  for (const user of users) {
    const userData = await getUserData(user);
    if (userData) {
      const skippedContests = processUserData(userData);
      results.push({ userID: user, skippedContests });
    }
  }

  return results;
}

function processUsers(contests, users) {
  const results = [];

  users.forEach((user) => {
    let noOfSkipped = 0;
    const userResult = {
      userID: user.userID,
      noOfSkipped: 0,
      contests: [],
    };

    user.skippedContests.forEach((skippedContest) => {
      const contest = contests.find(
        (c) => c.contestId === skippedContest.contestId
      );
      if (contest) {
        const contestEndTime = contest.startTime + contest.duration;
        let cheated = true;

        for (const submission of skippedContest.submissions) {
          if (
            (submission.verdict === "OK" || submission.verdict === "PARTIAL") &&
            submission.time <= contestEndTime
          ) {
            cheated = false;
            break;
          }
        }

        if (!cheated) noOfSkipped++;
        userResult.contests.push({
          contestId: skippedContest.contestId,
          cheated,
        });
      }
    });

    userResult.noOfNonCheated = noOfSkipped;
    userResult.noOfCheated = user.skippedContests.length - noOfSkipped;
    results.push(userResult);
  });

  return results;
}

app.post("/fetch-user-data", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).send("Username is required");
  }

  const users = [username];
  const userData = await getUsersData(users);

  // Assuming contests.json is already present
  const contests = JSON.parse(
    fs.readFileSync(path.join(__dirname, "contests.json"), "utf8")
  );
  const processedResults = processUsers(contests, userData);

  res.json(processedResults);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
