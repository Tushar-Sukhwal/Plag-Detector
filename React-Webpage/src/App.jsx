import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import contestsData from "./../contests.json"; // Import the JSON file directly
import { Toaster, toast } from "react-hot-toast";

function App() {
  const [userId, setUserId] = useState("");
  const [userIds, setUserIds] = useState(() => {
    const savedUserIds = localStorage.getItem("userIds");
    return savedUserIds ? JSON.parse(savedUserIds) : [];
  });
  const [results, setResults] = useState(() => {
    const savedResults = localStorage.getItem("results");
    return savedResults ? JSON.parse(savedResults) : [];
  });
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    localStorage.setItem("userIds", JSON.stringify(userIds));
  }, [userIds]);

  useEffect(() => {
    localStorage.setItem("results", JSON.stringify(results));
  }, [results]);

  const handleAddUserId = async () => {
    if (userId.trim() !== "") {
      if (!userIds.includes(userId.trim())) {
        setLoading(true);
        const userData = await fetchData(userId.trim());
        setLoading(false);

        if (userData) {
          const skippedContests = processUserData(userData);
          const processedResults = processUserResults(
            skippedContests,
            contestsData
          );
          setUserIds([userId.trim(), ...userIds]);
          setResults([{ userID: userId.trim(), processedResults }, ...results]);
          setUserId("");
        } else {
          toast.error("Failed to fetch user data.");
        }
      } else {
        toast.error("User ID already exists!");
      }
    }
  };

  const fetchData = async (handle) => {
    try {
      console.log(`Fetching data for ${handle}`);
      const url = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`;
      const response = await axios.get(url);
      console.log(`Data fetched for ${handle}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching data for ${handle}: ${error.message}`);
      return null;
    }
  };

  const processUserData = (data) => {
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
  };

  const processUserResults = (skippedContests, contests) => {
    const results = [];

    skippedContests.forEach((skippedContest) => {
      const contest = contests.find(
        (c) => c.contestId === skippedContest.contestId
      );
      if (contest) {
        const contestEndTime = contest.startTime + contest.duration;
        let cheated = true;

        skippedContest.submissions.forEach((submission) => {
          if (
            (submission.verdict === "OK" || submission.verdict === "PARTIAL") &&
            submission.time <= contestEndTime
          ) {
            cheated = false;
          }
        });

        results.push({ contestId: skippedContest.contestId, cheated });
      }
    });

    return results;
  };

  const handleCardClick = (userId) => {
    setSelectedUser(selectedUser === userId ? null : userId);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4">User ID List</h1>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter User ID"
        />
        <button
          onClick={handleAddUserId}
          className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add User ID
        </button>
      </div>
      {loading && <div className="loader mb-4">Loading...</div>}
      <ul className="w-full max-w-md bg-white rounded-md shadow-sm">
        {results.map((user, index) => (
          <li
            key={user.userID}
            className="px-4 py-2 border-b last:border-b-0 cursor-pointer"
            onClick={() => handleCardClick(user.userID)}
          >
            <div
              className={`p-4 rounded-md shadow-sm ${
                user.processedResults.some((result) => result.cheated)
                  ? "bg-red-200"
                  : "bg-green-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{user.userID}</h2>
                <span className="px-2 py-1 bg-gray-300 rounded-md">
                  Cheated:{" "}
                  {
                    user.processedResults.filter((result) => result.cheated)
                      .length
                  }
                  /{user.processedResults.length}
                </span>
              </div>
              {selectedUser === user.userID && (
                <div className="mt-2 p-2 bg-white rounded-md shadow-sm">
                  <h3 className="text-lg font-bold mb-2">Contests</h3>
                  {user.processedResults.map((contest, index) => (
                    <div
                      key={index}
                      className={`mb-2 p-2 ${
                        contest.cheated ? "bg-red-200" : "bg-green-200"
                      }`}
                    >
                      <h4
                        className={`text-lg font-bold ${
                          contest.cheated ? "text-red-700" : "text-green-700"
                        }`}
                      >
                        Contest ID: {contest.contestId}
                      </h4>
                      <p>Cheated: {contest.cheated ? "Yes" : "No"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <p>Made with love by Tushar Sukhwal</p>
        <p>
          <a
            href="https://www.linkedin.com/in/tushar-sukhwal-57463a251/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            LinkedIn
          </a>{" "}
          |&nbsp;
          <a
            href="https://github.com/Tushar-Sukhwal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            GitHub
          </a>{" "}
          |&nbsp;
          <a
            href="https://codeforces.com/profile/Tushars_07"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Codeforces
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;
