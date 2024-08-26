# LeetCode Friends List Extension

## Overview

The **LeetCode Friends List Extension** is a Chrome extension that allows users to manage and view their LeetCode friends list directly on their profile page. The extension adds a custom section to the user's LeetCode profile where friends can be added, removed, and reordered. It also verifies if friends exist on LeetCode and displays their usernames as clickable links.

## Features

- **Manage Friends List**: Add, remove, and reorder friends.
- **Verify Friend Existence**: Checks if a friend’s LeetCode profile exists.
- **UI Integration**: Injects a custom friends list section into the LeetCode profile page.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/SiddharthJiyani/Leetcode-friends-list-extention.git
   ```

2. **Load the Extension**:

   1. Open Chrome and navigate to `chrome://extensions/`.
   2. Enable "Developer mode" using the toggle switch.
   3. Click "Load unpacked" and select the directory where you cloned the repository.

## Usage

1. **Save Your Username**:
   - Click the extension icon in Chrome and enter your LeetCode username. Click "Save Username" to store it.

2. **Add Friends**:
   - Enter a friend's LeetCode username and click "Add Friend" to include them in your friends list.

3. **Remove Friends**:
   - Click the "Remove" button next to a friend's name in the list to remove them.

## File Structure

- `manifest.json`: Chrome extension manifest file.
- `popup.html`: HTML file for the extension's popup interface.
- `popup.js`: JavaScript file handling the extension's logic.
- `style.css`: CSS file for styling the popup interface.

## Code Explanation

- **`checkUserExists(username)`**: Asynchronously checks if a LeetCode user exists by fetching their profile page.
- **`injectFriendsList()`**: Injects the friends list section into the LeetCode profile page, including validation for friend existence.
- **`getUsernameFromURL()`**: Retrieves the current LeetCode username from the URL.
- **`isOwnProfile()`**: Determines if the current profile belongs to the user by comparing stored usernames.
- **`addFriend(username)`**: Adds a friend to the list and saves it in Chrome storage.
- **`removeFriend(username)`**: Removes a friend from the list and updates Chrome storage.

## Contributing

Feel free to submit issues and pull requests if you have improvements or fixes. To contribute, please fork the repository and create a pull request with your changes.

## Contact

For questions or support, please open an issue in the repository or contact [sidjiyani2003@example.com](mailto:sidjiyani2003@example.com).
