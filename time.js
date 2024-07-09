const fs = require('fs');

const contests = require('./contests.json');

const users = require('./users.json');

function processUsers(contests, users) {
  const results = [];

  users.forEach(user => {
    let noOfSkipped = 0;
    const userResult = {
      userID: user.userID,
      noOfSkipped: 0,
      contests: []
    };

    user.skippedContests.forEach(skippedContest => {
      const contest = contests.find(c => c.contestId === skippedContest.contestId);
      if (contest) {
        const contestEndTime = contest.startTime + contest.duration;


        let cheated = true;

        console.log("submissionTime","contestStartTime","contestEndTime")
        for (const submission of skippedContest.submissions) {
          console.log(submission.time, contest.startTime, contestEndTime)

          if ((submission.verdict === "OK" || submission.verdict === "PARTIAL") && (submission.time <= contestEndTime)) {
            cheated = false;
            break;
          }
        }

        if (!cheated) noOfSkipped++;
        userResult.contests.push({ contestId: skippedContest.contestId, cheated });
      }
    });

    userResult.noOfNonCheated = noOfSkipped;
    userResult.noOfCheated = user.skippedContests.length - noOfSkipped;
    results.push(userResult);
  });

  return results;
}

const results = processUsers(contests, users);

fs.writeFile('results.json', JSON.stringify(results, null, 2), (err) => {
  if (err) throw err;
  console.log('Results saved to results.json');
});
