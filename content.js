async function checkUserExists(username) {
    const response = await fetch(`https://leetcode.com/${username}/`);
    return response.status === 200;
}

async function injectFriendsList() {
    const friends = await new Promise(resolve => {
        chrome.storage.sync.get(['friends'], result => resolve(result.friends || []));
    });

    const validFriends = await Promise.all(friends.map(async friend => {
        const exists = await checkUserExists(friend);
        return exists ? friend : null;
    }));

    if (validFriends.length === 0) {
        return; 
    }

    const friendsListHTML = `
        <div id="leetcode-friends-list" style="margin-top: 10px; padding: 10px; background-color: #2d2d2d; border-radius: 5px;">
            <h3 style="font-size: 1em; font-weight: bold; color: #f5f5f5; margin-bottom: 8px; text-align: left;">Friends List</h3>
            <ul style="list-style-type: none; padding-left: 0; margin: 0;">
                ${validFriends.filter(Boolean).map(friend => 
                    `<li style="margin-bottom: 5px;">
                        <a target="_blank" href="https://leetcode.com/${friend}/" style="text-decoration: none; color: #9fa1a4;">${friend}</a>
                    </li>`
                ).join('')}
            </ul>
        </div>
    `;
    
    // const profileContainer = document.querySelector('.bg-green-0');
    const profileContainer = document.querySelector('.border-divider-3');
    if (profileContainer) {
        const existingFriendsList = document.querySelector('#leetcode-friends-list');
        if (existingFriendsList) {
            existingFriendsList.remove(); 
        }
        profileContainer.insertAdjacentHTML('beforebegin', friendsListHTML);
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