let friendsPerPage = 6;
let currentPage = 1;
let friendsList = [];

async function checkUserExists(username) {
    const response = await fetch(`https://leetcode.com/${username}/`);
    return response.status === 200;
}

async function injectFriendsList() {
    // Fetch friends list from storage if not already loaded
    if (friendsList.length === 0) {
        friendsList = await new Promise(resolve => {
            chrome.storage.sync.get(['friends'], result => resolve(result.friends || []));
        });

        // Validate and filter friends who actually exist
        friendsList = await Promise.all(friendsList.map(async friend => {
            const exists = await checkUserExists(friend);
            return exists ? friend : null;
        }));
        friendsList = friendsList.filter(Boolean).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    }

    // Paginate the results
    const friendsToShow = friendsList.slice(0, currentPage * friendsPerPage);

    // If no friends match the criteria, exit early
    if (friendsToShow.length === 0) {
        const existingFriendsList = document.querySelector('#leetcode-friends-list');
        if (existingFriendsList) {
            existingFriendsList.remove();
        }
        return;
    }

    const friendsListHTML = `
        <div id="leetcode-friends-list" style="margin-top: 10px; padding: 10px; background-color: #2d2d2d; border-radius: 5px;">
            <h3 style="font-size: 1em; font-weight: bold; color: #f5f5f5; margin-bottom: 8px; text-align: left;">Friends List</h3>
            <ul style="list-style-type: none; padding-left: 0; margin: 0;">
                ${friendsToShow.map(friend => 
                    `<li style="margin-bottom: 5px;">
                        <a target="_blank" href="https://leetcode.com/${friend}/" style="text-decoration: none; color: #9fa1a4;">${friend}</a>
                    </li>`
                ).join('')}
            </ul>
            <button id="showMore" style="display: ${friendsToShow.length < friendsList.length ? 'block' : 'none'}; width: 100%; margin-top: 10px; padding: 5px;">Show More</button>
        </div>
    `;
    
    const profileContainer = document.querySelector('.border-divider-3');
    if (profileContainer) {
        const existingFriendsList = document.querySelector('#leetcode-friends-list');
        if (existingFriendsList) {
            existingFriendsList.remove(); 
        }
        profileContainer.insertAdjacentHTML('beforebegin', friendsListHTML);

        // Attach event listener for the "Show More" button
        document.getElementById('showMore').addEventListener('click', () => {
            currentPage++;
            injectFriendsList();
        });
    }
}

function getUsernameFromURL() {
    const pathArray = window.location.pathname.split('/').filter(Boolean);
    return pathArray.length > 1 ? pathArray[1] : null;
}

function isOwnProfile() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['ownUsername'], (result) => {
            const yourUsername = result.ownUsername;
            const currentUsername = getUsernameFromURL();
            resolve(currentUsername === yourUsername);
        });
    });
}

isOwnProfile().then(isOwn => {
    if (isOwn) {
        injectFriendsList();
    }
});
