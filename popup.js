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
    const friendUsername = document.getElementById('friendUsername').value;
    if (friendUsername) {
        const exists = await checkUserExists(friendUsername);
        if (exists) {
            chrome.storage.sync.get(['friends'], (result) => {
                const friends = result.friends || [];
                if (!friends.includes(friendUsername)) {
                    friends.push(friendUsername);
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
});

function removeFriend(username) {
    chrome.storage.sync.get(['friends'], (result) => {
        const friends = result.friends || [];
        const updatedFriends = friends.filter(friend => friend !== username);
        chrome.storage.sync.set({ friends: updatedFriends }, () => {
            updateFriendsList();
        });
    });
}

function updateFriendsList() {
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';
    chrome.storage.sync.get(['friends'], (result) => {
        const friends = result.friends || [];
        friends.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        friends.forEach((friend) => {
            const li = document.createElement('li');
            li.className = 'friend-item';

            const a = document.createElement('a');
            a.href = `https://leetcode.com/${friend}/`;
            a.textContent = friend;
            a.target = '_blank';

            const removeBtn = document.createElement('span');
            removeBtn.textContent = 'remove';
            removeBtn.className = 'remove-btn';
            removeBtn.onclick = () => removeFriend(friend);

            li.appendChild(a);
            li.appendChild(removeBtn);
            friendsList.appendChild(li);
        });
    });
}

updateFriendsList();
