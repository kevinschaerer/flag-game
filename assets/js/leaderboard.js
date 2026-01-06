// Initialize supabase
import { supa } from "/assets/js/supa.js";

// Initialize variables
let leaderboardEntries = document.getElementById("container-entries");
let totalEntries;
const entriesPerPage = 10;
let currentPage = 1;
let displayCurrentPage = document.getElementById("current-page");
let nextPage = document.getElementById("next-page");
let previousPage = document.getElementById("previous-page");

// Add event listener to the 'next page' button
nextPage.addEventListener("click", () => {
  leaderboardEntries.innerHTML = "";
  updateLeaderboard(currentPage + 1); // Pass the incremented value directly
  console.log("Next page clicked");
});

// Add event listener to the 'previous page' button
previousPage.addEventListener("click", () => {
  leaderboardEntries.innerHTML = "";
  updateLeaderboard(currentPage - 1); // Pass the decremented value directly
});

async function updateLeaderboard(pageToLoad = 1) {
  // Add default argument for initial call
  currentPage = pageToLoad; // Update currentPage with the passed value
  let rank = (currentPage - 1) * entriesPerPage + 1;
  let rankId = (currentPage - 1) * entriesPerPage + 1;

  const { data: getTotalEntries, error: lengthError } = await supa
    .from("scoreboard")
    .select("*");

  // console.log(getTotalEntries);
  totalEntries = getTotalEntries.length;

  const { data: entries, error: userError } = await supa
    .from("scoreboard")
    .select("*")
    .order("score", {
      ascending: false,
    })
    .order("elapsed_time", {
      ascending: true,
    })
    .range(
      (currentPage - 1) * entriesPerPage,
      currentPage * entriesPerPage - 1
    );

  // console.log("Total entries:", entries.length);

  if (userError) {
    console.error("Error fetching user data:", userError);
  }

  // console.log(entries);
  // console.log(currentPage);

  entries.forEach((row) => {
    function convertDateFormat(dateString) {
      // Parse the input date string
      const inputDate = new Date(dateString);

      // Extract date components
      const day = inputDate.getDate();
      const month = inputDate.toLocaleString("en-US", { month: "short" });
      const year = inputDate.getFullYear();

      // Extract time components with formatting
      const hours = inputDate.getHours() % 12 || 12; // Use 12 for midnight/noon
      const minutes = inputDate.getMinutes().toString().padStart(2, "0");
      const ampm = inputDate.getHours() >= 12 ? "PM" : "AM";

      // Format the output date string using template literals
      const formattedDate = `${day} ${month} ${year}`;

      // Combine date and time with "at" and AM/PM indicator
      const finalDate = `${formattedDate} at ${hours}:${minutes} ${ampm}`;

      return finalDate;
    }

    let inputDateString = row.created_at;
    let outputDateString = convertDateFormat(inputDateString);

    leaderboardEntries.innerHTML += `
          <tr class="leaderboard-row" id="${"rank-" + rankId++}">
              <td class="user-rank">${rank++}</td>
              <td class="user-username">${row.username}</td>
              <td class="user-created-at">${outputDateString}</td>
              <td class="user-score">${row.score}</td>
              <td class="user-elapsed-time">${row.elapsed_time}</td>
          </tr>
      `;
  });

  let totalPages = Math.ceil(totalEntries / entriesPerPage);

  displayCurrentPage.innerHTML = currentPage;
  // console.log("Current page: " + currentPage);

  // console.log(currentPage);
  // console.log(totalPages);
  // console.log(currentPage === totalPages);

  // Disable next page button
  if (currentPage === totalPages) {
    nextPage.disabled = true;
  } else {
    nextPage.disabled = false;
  }

  // Disable previous page button
  if (currentPage > 1) {
    previousPage.disabled = false;
  } else {
    previousPage.disabled = true;
  }
}

updateLeaderboard();
