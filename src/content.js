let friendsPerPage = 6;
let currentPage = 1;
let friendsList = [];

// Check if a username exists by fetching their LeetCode page
async function checkUserExists(username) {
    const response = await fetch(`https://leetcode.com/${username}/`);
    return response.status === 200;
}

// Get the friends list from Chrome storage
async function getFriendsList() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['friends'], (result) => resolve(result.friends || []));
    });
}

// Add or remove a friend in Chrome storage
async function updateFriendsList(newList) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ friends: newList }, () => resolve());
    });
}

// Inject the friends list into the page
async function injectFriendsList() {
    // Load friends list if not already done
    console.log('isOwnProfile', await isOwnProfile());
    if (!(await isOwnProfile())) {
        console.log('Not own profile');
        return;
    }
    if (friendsList.length === 0) {
        friendsList = await getFriendsList();
        friendsList = await Promise.all(friendsList.map(async (friend) => {
            const exists = await checkUserExists(friend);
            return exists ? friend : null;
        }));
        friendsList = friendsList.filter(Boolean).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    }

    const friendsToShow = friendsList.slice(0, currentPage * friendsPerPage);
    if (friendsToShow.length === 0) {
        const existingFriendsList = document.querySelector('#leetcode-friends-list');
        if (existingFriendsList) {
            existingFriendsList.remove();
        }
        return;
    }

    // Styling and theme settings...
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const colors = {
        dark: {
            background: '#2d2d2d',
            text: '#f5f5f5',
            link: '#9fa1a4',
            buttonBg: '#444444',
            buttonText: '#f5f5f5',
            hoverModalBg: 'transparent',
            hoverModalBorder: '#444444',
            iframeTheme: 'dark'
        },
        light: {
            background: '#f5f5f5',
            text: '#000000',
            link: '#000000',
            buttonBg: '#dddddd',
            buttonText: '#000000',
            hoverModalBg: 'transparent',
            hoverModalBorder: '#cccccc',
            iframeTheme: 'light'
        }
    };

    const selectedColors = colors[theme];

    const friendsListContainer = document.createElement('div');
    friendsListContainer.id = 'leetcode-friends-list';
    friendsListContainer.style.marginTop = '10px';
    friendsListContainer.style.padding = '10px';
    friendsListContainer.style.backgroundColor = selectedColors.background;
    friendsListContainer.style.borderRadius = '5px';

    const header = document.createElement('h3');
    header.textContent = 'Friends List';
    header.style.fontSize = '1em';
    header.style.fontWeight = 'bold';
    header.style.color = selectedColors.text;
    header.style.marginBottom = '8px';
    header.style.textAlign = 'left';
    friendsListContainer.appendChild(header);

    const list = document.createElement('ul');
    list.style.listStyleType = 'none';
    list.style.paddingLeft = '0';
    list.style.margin = '0';

    // Display friends list...
    friendsToShow.forEach((friend) => {
        const listItem = document.createElement('li');
        listItem.style.position = 'relative';
        listItem.style.marginBottom = '5px';

        const link = document.createElement('a');
        link.href = `https://leetcode.com/${friend}/`;
        link.target = '_blank';
        link.textContent = friend;
        link.style.textDecoration = 'none';
        link.style.color = selectedColors.link;
        link.style.position = 'relative';
        link.style.zIndex = '1';

        const hoverModal = document.createElement('div');
        hoverModal.style.position = 'absolute';
        hoverModal.style.left = '90%';
        hoverModal.style.top = '50%';
        hoverModal.style.transform = 'translateY(-50%)';
        hoverModal.style.zIndex = '10';
        hoverModal.style.backgroundColor = 'transparent';
        hoverModal.style.padding = '5px';
        hoverModal.style.opacity = '0';
        hoverModal.style.visibility = 'hidden';
        hoverModal.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
        hoverModal.style.pointerEvents = 'none';
        hoverModal.style.width = 'auto';

        const iframe = document.createElement('iframe');
        iframe.src = `https://leetcard.jacoblin.cool/${friend}?width=500&height=200&animation=false&theme=${theme === 'dark' ? 'dark' : 'light'}&font=Noto%20Sans&ext=contest`;
        iframe.width = 'auto';
        iframe.height = '240px';
        iframe.style.border = 'none';
        hoverModal.appendChild(iframe);

        let hoverTimeout;

        link.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                hoverModal.style.opacity = '1';
                hoverModal.style.visibility = 'visible';
            }, 300);
        });

        link.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                hoverModal.style.opacity = '0';
                hoverModal.style.visibility = 'hidden';
            }, 300);
        });

        listItem.appendChild(link);
        listItem.appendChild(hoverModal);
        list.appendChild(listItem);
    });

    friendsListContainer.appendChild(list);

    // "Show More" Button
    if (friendsToShow.length < friendsList.length) {
        const showMoreButton = document.createElement('button');
        showMoreButton.id = 'showMore';
        showMoreButton.textContent = 'Show More';
        showMoreButton.style.display = 'block';
        showMoreButton.style.width = '100%';
        showMoreButton.style.marginTop = '10px';
        showMoreButton.style.padding = '5px';
        showMoreButton.style.backgroundColor = selectedColors.buttonBg;
        showMoreButton.style.color = selectedColors.buttonText;
        showMoreButton.style.border = 'none';
        showMoreButton.style.borderRadius = '3px';
        showMoreButton.style.cursor = 'pointer';

        showMoreButton.addEventListener('click', () => {
            currentPage++;
            injectFriendsList();
        });

        friendsListContainer.appendChild(showMoreButton);
    }

    const profileContainer = document.querySelector('.border-divider-3');
    if (profileContainer) {
        const existingFriendsList = document.querySelector('#leetcode-friends-list');
        if (existingFriendsList) {
            existingFriendsList.remove();
        }
        profileContainer.insertAdjacentElement('beforebegin', friendsListContainer);
    }
}

// Function to inject "Add Friend" or "Remove Friend" button
async function injectAddRemoveFriendButton() {
    const currentUsername = getUsernameFromURL();
    if (!currentUsername || (await isOwnProfile())) return;

    const friends = await getFriendsList();
    const isFriend = friends.includes(currentUsername);
    const button = document.createElement('button');
    button.textContent = isFriend ? 'Remove Friend' : 'Add Friend';
    button.className = 'w-full rounded-lg py-[7px] text-center font-medium';
    button.style.transition = 'background-color 0.15s, color 0.15s';
    button.style.marginTop = '10px';
    button.style.cursor = 'pointer';

    const isDarkMode = document.documentElement.classList.contains('dark');
    if (isFriend) {
        button.style.backgroundColor = '#ff253a1f';
        button.style.color = isDarkMode ? '#ff253a' : '#dc3545';
    } else {
        button.style.backgroundColor = '#2cbb5d1f';
        button.style.color = isDarkMode ? 'rgb(44 187 93)' : '#2cbb5d';
    }

    button.addEventListener('mouseover', () => {
        if (isFriend) {
            button.style.backgroundColor = isDarkMode ? '#ff253a33' : '#ff253a26';
        } else {
            button.style.backgroundColor = isDarkMode ? '#3da76a33' : '#2cbb5d33';
        }
    });

    button.addEventListener('mouseout', () => {
        if (isFriend) {
            button.style.backgroundColor = '#ff253a1f';
        } else {
            button.style.backgroundColor = '#2cbb5d1f';
        }
    });


    button.addEventListener('click', async () => {
        let updatedFriends;
        if (isFriend) {
            updatedFriends = friends.filter((friend) => friend !== currentUsername);
        } else {
            updatedFriends = [...friends, currentUsername];
        }
        await updateFriendsList(updatedFriends);
        injectAddRemoveFriendButton(); // Refresh button after update
    });

    const profileContainer = document.querySelector('.border-divider-3');
    if (profileContainer) {
        const existingButton = document.querySelector('#addRemoveFriendButton');
        if (existingButton) {
            existingButton.remove();
        }
        button.id = 'addRemoveFriendButton';
        profileContainer.insertAdjacentElement('beforebegin', button);
    }
}

function handleThemeChange() {
    const observer = new MutationObserver(() => {
        injectFriendsList();
        injectAddRemoveFriendButton();
    });
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });
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

// Check if it's your own profile or someone else's
isOwnProfile().then((isOwn) => {
    if (isOwn) {
        setTimeout(injectFriendsList, 1000);
        handleThemeChange(); // Monitor and handle theme changes
    } else {
        setTimeout(injectAddRemoveFriendButton, 1000); // Add "Add/Remove Friend" button on someone else's profile
    }
});


