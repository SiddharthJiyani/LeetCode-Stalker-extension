const LC_API = "https://alfa-leetcode-api.onrender.com/";
const backup_API = "https://leetcode-stats-api.herokuapp.com/";
// https://github.com/alfaarghya/alfa-leetcode-api  -- for the API
// https://github.com/Algolisted-Org/LC-Live-Friends-Rating -- for Live contest rating

// Initialize the tabs
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", function () {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((tc) => tc.classList.remove("active"));

    this.classList.add("active");
    document
      .getElementById(this.getAttribute("data-tab"))
      .classList.add("active");
  });
});

// to get solved problems
async function getSolvedProblems(username) {
  try {
    // First try fetching from the primary API
    const response = await fetch(`${LC_API}${username}/solved`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Primary API failed.");
    }
  } catch (error) {
    console.error("Primary API failed, trying backup API:", error);
    try {
      // If the primary API fails, fetch from the backup API
      const backupResponse = await fetch(`${backup_API}${username}/`);
      if (!backupResponse.ok) {
        throw new Error("Both APIs failed.");
      }
      return await backupResponse.json();
    } catch (backupError) {
      console.error("Backup API failed as well:", backupError);
      return null;
    }
  }
}


// to get rating of user
async function getRating(username) {
  try {
    // First try fetching from the primary API
    const response = await fetch(`${LC_API}${username}/contest`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Primary API failed.");
    }
  } catch (error) {
    console.error("Primary API failed, trying backup API:", error);
    try {
      // If the primary API fails, fetch from the backup API
      const backupResponse = await fetch(`${backup_API}${username}/`);
      if (!backupResponse.ok) {
        throw new Error("Both APIs failed.");
      }
      return await backupResponse.json();
    } catch (backupError) {
      console.error("Backup API failed as well:", backupError);
      return null;
    }
  }
}


// To get number of problems solved from api
function createSolvedProblemsTable(solvedData,ratings) {
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.marginTop = "10px";
  table.style.color = "#ffa116";

  const headers = ["Total", "Easy", "Medium", "Hard","Rating"];
  
  // Define the colors for each header
  const colors = ["white", "#1cbaba", "#f8b302", "#f63737","white"];

  const thead = document.createElement("thead");
  const tr = document.createElement("tr");

  headers.forEach((header, index) => {
    const th = document.createElement("th");
    th.textContent = header;
    th.style.borderBottom = "1px solid #555";
    th.style.paddingBottom = "5px";
    th.style.textAlign = "center";
    th.style.color = colors[index]; // Apply the corresponding color to the header
    tr.appendChild(th);
  });

  thead.appendChild(tr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const trBody = document.createElement("tr");

  const solvedNumbers = [
    solvedData.solvedProblem, // ! handle here if backup api is used then we use solvedData.totalSolved
    solvedData.easySolved,
    solvedData.mediumSolved,
    solvedData.hardSolved,
		Math.round(ratings.contestRating)
  ];


  solvedNumbers.forEach((solved, index) => {
    const td = document.createElement("td");
    td.textContent = solved;
    td.style.textAlign = "center";
    td.style.paddingTop = "5px";
    td.style.color = colors[index]; // Apply the corresponding color to the data cell
    trBody.appendChild(td);
  });

  tbody.appendChild(trBody);
  table.appendChild(tbody);

  return table;
}



document.getElementById("saveUsername").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  if (username) {
    chrome.storage.sync.set({ ownUsername: username }, () => {
      alert("Your username has been saved.");
    });
  }
});

async function checkUserExists(username) {
  const response = await fetch(`https://leetcode.com/${username}/`);
  return response.status === 200;
}

document.getElementById("addFriend").addEventListener("click", async () => {
  addFriend();
});

document
  .getElementById("friendUsername")
  .addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default action (form submission)
      addFriend();
    }
  });

document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the saved username from Chrome storage
  chrome.storage.sync.get(["ownUsername"], (result) => {
    const savedUsername = result.ownUsername;

    // Check if a username is saved
    if (savedUsername) {
      // User is logged in; show a welcome message
      document.getElementById(
        "welcomeMessage"
      ).innerHTML = `Hello👋, <a href="https://leetcode.com/u/${savedUsername}/" target="_blank" class="username" style="font-weight: bold; background-color="transparent";>${savedUsername}</a> !`;
      document.getElementById("usernameContainer").style.display = "none"; // Hide the username input

      // Add a change username button
      const changeUsernameBtn = document.getElementById("changeUsername");
      // changeUsernameBtn.innerText = 'Change Username';
      changeUsernameBtn.addEventListener("click", () => {
        document.getElementById("welcomeMessage").innerText = "";
        document.getElementById("usernameContainer").style.display = "block"; // Show the username input
      });
      document.getElementById("welcomeMessage").appendChild(changeUsernameBtn);
    } else {
      // No username saved; show the input for username
      document.getElementById("welcomeMessage").innerText = "";
      document.getElementById("usernameContainer").style.display = "block"; // Show the username input
    }
  });
});

// Enter key functionality for search
document
  .getElementById("searchFriends")
  .addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default action (form submission)
      const searchTerm = document.getElementById("searchFriends").value;
      updateFriendsList(searchTerm);
    }
  });

async function addFriend() {
  const friendUsername = document.getElementById("friendUsername").value;
  if (friendUsername) {
    const exists = await checkUserExists(friendUsername);
    if (exists) {
      chrome.storage.sync.get(["friends"], (result) => {
        const friends = result.friends || [];
        if (!friends.includes(friendUsername)) {
          friends.push(friendUsername);
          document.getElementById("friendUsername").value = "";
          chrome.storage.sync.set({ friends: friends }, () => {
            updateFriendsList();
          });
        } else {
          alert("This friend is already in your list.");
        }
      });
    } else {
      alert("This username does not exist on LeetCode.");
    }
  }
}

function removeFriend(username) {
  chrome.storage.sync.get(["friends"], (result) => {
    const friends = result.friends || [];
    const updatedFriends = friends.filter((friend) => friend !== username);
    chrome.storage.sync.set({ friends: updatedFriends }, () => {
      updateFriendsList();
    });
  });
}

function showLoadingSpinner() {
  document.getElementById("loadingSpinner").style.display = "block";
}

function hideLoadingSpinner() {
  document.getElementById("loadingSpinner").style.display = "none";
}

function updateFriendsList(searchTerm = "") {
  const friendsList = document.getElementById("friendsList");
  friendsList.innerHTML = ""; // Clear the existing list

  // Show the loading spinner
  showLoadingSpinner();

  chrome.storage.sync.get(["friends"], async (result) => {
    let friends = result.friends || [];
    friends.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    if (searchTerm) {
      searchTerm = searchTerm.toLowerCase();
      friends = friends.filter((friend) =>
        friend.toLowerCase().includes(searchTerm)
      );
    }

    for (const friend of friends) {
      const li = document.createElement("li");
      li.className = "friend-item";

      const a = document.createElement("a");
      a.href = `https://leetcode.com/${friend}/`;
      a.textContent = friend.substring(0,10) + "...";
      a.target = "_blank";
			a.style.marginRight = "10px";

      const removeBtn = document.createElement("span");
      removeBtn.className = "remove-btn";
      removeBtn.style.backgroundImage = 'url("./icons/delete.png")';
      removeBtn.style.backgroundSize = "16px 16px";
      removeBtn.style.backgroundRepeat = "no-repeat";
      removeBtn.style.width = "20px";
      removeBtn.style.height = "20px";
			removeBtn.style.paddingLeft = "5px";
      removeBtn.style.cursor = "pointer";
      removeBtn.onclick = () => removeFriend(friend);

      const solvedData = await getSolvedProblems(friend);
			const ratings = await getRating(friend);
      const table = solvedData
        ? createSolvedProblemsTable(solvedData,ratings)
        : document.createTextNode("Could not fetch data.");

      li.appendChild(a); // Append the link with the friend's name
      li.appendChild(table); // Append the table with solved problem stats
      li.appendChild(removeBtn); // Append the remove button

      friendsList.appendChild(li); // Append the entire list item to the friends list
    }

    // Hide the loading spinner once all data is fetched
    hideLoadingSpinner();
  });
}


document.addEventListener('DOMContentLoaded', () => {
	hideLoadingSpinner(); // Make sure the spinner is hidden on page load.
	updateFriendsList();
});


document.getElementById("searchFriend").addEventListener("click", () => {
  const searchTerm = document.getElementById("searchFriends").value;
  updateFriendsList(searchTerm);
});

