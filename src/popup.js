const LC_API = 'https://leetcode.com/graphql'; 


// to get solved problems
async function getSolvedProblems(username) {
  const query = `
    query {
      matchedUser(username: "${username}") {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(LC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error('Error fetching solved problems:', data.errors);
      return null;
    }

    const submissionData = data.data.matchedUser.submitStats.acSubmissionNum;
    const solvedData = {
      easySolved: submissionData.find((item) => item.difficulty === 'Easy').count,
      mediumSolved: submissionData.find((item) => item.difficulty === 'Medium').count,
      hardSolved: submissionData.find((item) => item.difficulty === 'Hard').count,
    };

    return solvedData;
  } catch (error) {
    console.error('Failed to fetch solved problems:', error);
    return null;
  }
}


// to get rating of user
async function getRating(username) {
  const query = `
    query {
      userContestRanking(username: "${username}") {
        rating
        topPercentage
      }
    }
  `;

  try {
    const response = await fetch(LC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error('Error fetching contest rating:', data.errors);
      return null;
    }

    const ratingData = data.data.userContestRanking?.rating || null;
    const topPercentage = data.data.userContestRanking?.topPercentage || null;
    return { contestRating: ratingData, topPercentage: topPercentage };
  } catch (error) {
    console.error('Failed to fetch contest rating:', error);
    return null;
  }
}


// Fetch both solved problems and rating in parallel
async function fetchFriendData(friend) {
  const solvedDataPromise = getSolvedProblems(friend);
  const ratingDataPromise = getRating(friend);
  try {
    const [solvedData, ratings] = await Promise.all([solvedDataPromise, ratingDataPromise]);
    return { solvedData, ratings };
  } catch (error) {
    console.error(`Failed to fetch data for ${friend}:`, error);
    return null;
  }
}


// To get number of problems solved from API and create table
function createSolvedProblemsTable(solvedData, ratings) {
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.marginTop = "10px";
  table.style.color = "#ffa116";

  const headers = ["Total", "Easy", "Medium", "Hard", "Rating"];
  
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
    solvedData.easySolved + solvedData.mediumSolved + solvedData.hardSolved, 
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
    td.style.color = colors[index];
    trBody.appendChild(td);
  });

  const ratingTd = trBody.lastChild;
  const topPercentage = ratings.topPercentage;
  const rating = ratings.contestRating;
  console.log('rating', rating);
  if (topPercentage <= 5) {
    ratingTd.style.color = "transparent";
    ratingTd.style.background = "linear-gradient(to right, #82d9bc, #0d9a41)"; 
    ratingTd.style.webkitBackgroundClip = "text";
    ratingTd.style.backgroundClip = "text"; 
    ratingTd.style.fontWeight = "bold"; 
  }

  if(topPercentage <= 1){
    ratingTd.style.color = "transparent";
    ratingTd.style.background = "linear-gradient(to right,#a6c0ed , #1d77dc)"; 
    ratingTd.style.webkitBackgroundClip = "text";
    ratingTd.style.backgroundClip = "text"; 
    ratingTd.style.fontWeight = "bold";
  }

  if(rating == null){
    ratingTd.style.color = 'white'
    ratingTd.textContent = 'N/A';
    ratingTd.style.fontWeight = "normal";
  }


  tbody.appendChild(trBody);
  table.appendChild(tbody);

  return table;
}


document.getElementById("saveUsername").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  if (username) {
    chrome.storage.sync.set({ ownUsername: username }, () => {
      alert("Your username has been saved.");
      window.location.reload();
    });
  }
});

// on hitting enter key in username input field save username
document.getElementById("username").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const username = document.getElementById("username").value;
    if (username) {
      chrome.storage.sync.set({ ownUsername: username }, () => {
        alert("Your username has been saved.");
        window.location.reload();
      });
    }
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
      event.preventDefault();
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
      ).innerHTML = `Hello👋, <a href="https://leetcode.com/u/${savedUsername}/" target="_blank" class="username" style="font-weight: bold;">${savedUsername}</a> !`;
      document.getElementById("usernameContainer").style.display = "none";

      // Add a change username button
      const changeUsernameBtn = document.getElementById("changeUsername");
      changeUsernameBtn.addEventListener("click", () => {
        document.getElementById("welcomeMessage").innerText = "";
        document.getElementById("usernameContainer").style.display = "block";
      });
      document.getElementById("welcomeMessage").appendChild(changeUsernameBtn);
    } else {
      // No username saved; show the input for username
      document.getElementById("welcomeMessage").innerText = "";
      document.getElementById("usernameContainer").style.display = "block";
    }
  });
});

// Debounce function to limit the frequency of search calls
function debounce(func, delay) {
  let debounceTimer;
  return function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
  };
}

// Enter key functionality for search with debounce
document
  .getElementById("searchFriends")
  .addEventListener("keydown", debounce((event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const searchTerm = document.getElementById("searchFriends").value;
      updateFriendsList(searchTerm);
    }
  }, 300));

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

function sortFriendsData(friendsData, sortBy) {
  return friendsData.sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
    } else if (sortBy === 'rating') {
      return (b.ratings.contestRating || 0) - (a.ratings.contestRating || 0);
    } else if (sortBy === 'solved') {
      const aTotalSolved = a.solvedData.easySolved + a.solvedData.mediumSolved + a.solvedData.hardSolved;
      const bTotalSolved = b.solvedData.easySolved + b.solvedData.mediumSolved + b.solvedData.hardSolved;
      return bTotalSolved - aTotalSolved;
    }
    return 0;
  });
}


function updateFriendsList(searchTerm = "", sortBy = "alphabetical") {
  const friendsList = document.getElementById("friendsList");
  friendsList.innerHTML = ""; // Clear the existing list

  // Show the loading spinner
  showLoadingSpinner();

  chrome.storage.sync.get(["friends"], async (result) => {
    let friends = result.friends || [];

    if (searchTerm) {
      searchTerm = searchTerm.toLowerCase();
      friends = friends.filter((friend) =>
        friend.toLowerCase().includes(searchTerm)
      );
    }

    const fetchPromises = friends.map(friend => fetchFriendData(friend).then(data => ({ ...data, username: friend })));
    let friendsData = await Promise.all(fetchPromises);

    // Sort the friendsData array based on the chosen sortBy criteria
    friendsData = sortFriendsData(friendsData.filter(Boolean), sortBy);

    // Now render each friend’s data
    friendsData.forEach((data) => {
      if (data) {
        const friend = data.username; // Use the username from data
        const li = document.createElement("li");
        li.className = "friend-item";
        li.style.position = "relative";

        const a = document.createElement("a");
        a.href = `https://leetcode.com/u/${friend}/`;
        a.textContent = friend;
        a.target = "_blank";
        a.style.marginRight = "10px";
        a.style.width = "100px";
        a.style.display = "inline-block";
        a.style.overflow = "hidden";
        a.style.textOverflow = "ellipsis";
        a.style.width = "150px";
        a.style.height = "30px"; 
        a.style.lineHeight = "30px";
        a.style.padding = "0 5px"; 

        // Hover modal
        const hoverModal = document.createElement('div');
        hoverModal.style.position = 'absolute';
        hoverModal.style.left = '0';
        hoverModal.style.zIndex = '10';
        hoverModal.style.backgroundColor = 'transparent';
        hoverModal.style.padding = '5px';
        hoverModal.style.width = '400px';
        hoverModal.style.pointerEvents = 'none';
        hoverModal.style.transform = 'translateY(-50%)';
        hoverModal.style.marginLeft = '30px';
        hoverModal.style.opacity = '0';
        hoverModal.style.visibility = 'hidden';
        hoverModal.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

        const iframe = document.createElement('iframe');
        iframe.src = `https://leetcard.jacoblin.cool/${friend}?width=500&height=250&animation=false&theme=dark&font=Noto%20Sans&ext=contest`;
        iframe.width = '400px';
        iframe.height = '250px';
        iframe.style.border = 'none';
        hoverModal.appendChild(iframe);

        let hoverTimeout;

        a.addEventListener('mouseover', () => {
          clearTimeout(hoverTimeout);
          hoverTimeout = setTimeout(() => {
            hoverModal.style.opacity = '1';
            hoverModal.style.visibility = 'visible';
          }, 300);
        });

        a.addEventListener('mouseout', () => {
          clearTimeout(hoverTimeout);
          hoverTimeout = setTimeout(() => {
            hoverModal.style.opacity = '0';
            hoverModal.style.visibility = 'hidden';
          }, 300);
        });

        li.appendChild(a);
        li.appendChild(hoverModal);

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

        const table = data.solvedData
          ? createSolvedProblemsTable(data.solvedData, data.ratings)
          : document.createTextNode("Could not fetch data.");

        li.appendChild(table);
        li.appendChild(removeBtn);

        friendsList.appendChild(li);
      }
    });

    // Hide the loading spinner once all data is fetched
    hideLoadingSpinner();
  });
}


// Add this event listener for the sort dropdown
document.getElementById("sortDropdown").addEventListener("change", (event) => {
  const sortBy = event.target.value;
  const searchTerm = document.getElementById("searchFriends").value;
  updateFriendsList(searchTerm, sortBy);
});

document.getElementById("searchFriends").addEventListener("keydown", debounce((event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const searchTerm = document.getElementById("searchFriends").value;
    const sortBy = document.getElementById("sortDropdown").value;
    updateFriendsList(searchTerm, sortBy);
  }
}, 300));

// Initialize friends list on page load
document.addEventListener('DOMContentLoaded', () => {
  hideLoadingSpinner(); // Make sure the spinner is hidden on page load.
  updateFriendsList("", "alphabetical");
});
