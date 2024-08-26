document.getElementById('saveUsername').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    if (username) {
        chrome.storage.sync.set({ ownUsername: username }, () => {
            alert('Your username has been saved.');
        });
    }
});

async function checkUserExists(username) {
    const response = await fetch(`https://leetcode.com/${username}/`);
    return response.status === 200;
}

document.getElementById('addFriend').addEventListener('click', async () => {
    addFriend();
});

document.getElementById('friendUsername').addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action (form submission)
        addFriend();
    }
});

// Enter key functionality for search
document.getElementById('searchFriends').addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action (form submission)
        const searchTerm = document.getElementById('searchFriends').value;
        updateFriendsList(searchTerm);
    }
});

async function addFriend() {
    const friendUsername = document.getElementById('friendUsername').value;
    if (friendUsername) {
        const exists = await checkUserExists(friendUsername);
        if (exists) {
            chrome.storage.sync.get(['friends'], (result) => {
                const friends = result.friends || [];
                if (!friends.includes(friendUsername)) {
                    friends.push(friendUsername);
                    document.getElementById('friendUsername').value = ''; // Clear the input
                    chrome.storage.sync.set({ friends: friends }, () => {
                        updateFriendsList();
                    });
                } else {
                    alert('This friend is already in your list.');
                }
            });
        } else {
            alert('This username does not exist on LeetCode.');
        }
    }
}

function removeFriend(username) {
    chrome.storage.sync.get(['friends'], (result) => {
        const friends = result.friends || [];
        const updatedFriends = friends.filter(friend => friend !== username);
        chrome.storage.sync.set({ friends: updatedFriends }, () => {
            updateFriendsList();
        });
    });
}

function updateFriendsList(searchTerm = '') {
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';
    chrome.storage.sync.get(['friends'], (result) => {
        let friends = result.friends || [];
        friends.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        if (searchTerm) {
            searchTerm = searchTerm.toLowerCase();
            friends = friends.filter(friend => friend.toLowerCase().includes(searchTerm));
        }

        friends.forEach((friend) => {
            const li = document.createElement('li');
            li.className = 'friend-item';

            const a = document.createElement('a');
            a.href = `https://leetcode.com/${friend}/`;
            a.textContent = friend;
            a.target = '_blank';

            const removeBtn = document.createElement('span');
            removeBtn.className = 'remove-btn';
            removeBtn.style.backgroundImage = 'url("./icons/delete.png")'; // Path to your delete icon
            removeBtn.style.backgroundSize = '16px 16px'; // Adjust the size as needed
            removeBtn.style.backgroundRepeat = 'no-repeat';
            removeBtn.style.width = '20px'; // Adjust the width as needed
            removeBtn.style.height = '20px'; // Adjust the height as needed
            removeBtn.style.cursor = 'pointer'; // To show a pointer cursor on hover
            removeBtn.onclick = () => removeFriend(friend);

            li.appendChild(a);
            li.appendChild(removeBtn);
            friendsList.appendChild(li);
        });
    });
}

document.getElementById('searchFriend').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchFriends').value;
    updateFriendsList(searchTerm);
});

updateFriendsList();
