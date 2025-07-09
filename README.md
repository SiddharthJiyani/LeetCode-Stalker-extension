# LeetCode Friends List Extension

## Overview

The **LeetCode Friends List Extension** is a Chrome extension that enhances your LeetCode experience by allowing you to manage and view your friends list directly on your profile page. With this extension, you can easily add, remove, and view your friends, ensuring that you stay connected with your coding peers.

## Features

- **Manage Friends List**: Add and remove in your list.
- **Verify Friend Existence**: Automatically checks if a friend's LeetCode profile exists when adding them to your list.
- **UI Integration**: Injects a custom friends list section directly into the LeetCode profile page, styled to match the LeetCode UI.
- **Friends Sorting**: Friends are automatically sorted alphabetically in the list.
  
## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/SiddharthJiyani/LeetCode-Stalker-extention.git
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
   - The extension verifies if the username exists before adding.

3. **Remove Friends**:
   - Click the "Remove" button next to a friend's name in the list to remove them.

4. **View Friends on Profile Page**:
   - Navigate to your LeetCode profile to view your friends list, which is now integrated into the page.
   - View up to 6 friends initially, with the option to load more friends by clicking "Show More."

## File Structure

- `manifest.json`: Chrome extension manifest file.
- `popup.html`: HTML file for the extension's popup interface.
- `popup.js`: JavaScript file handling the extension's logic.
- `content.js`: JavaScript file responsible for injecting the friends list into the LeetCode profile page.

## Code Explanation

- **`checkUserExists(username)`**: Asynchronously checks if a LeetCode user exists by fetching their profile page.
- **`injectFriendsList()`**: Injects the friends list section into the LeetCode profile page, including validation for friend existence and pagination (with "Show More" functionality).
- **`getUsernameFromURL()`**: Retrieves the current LeetCode username from the URL.
- **`isOwnProfile()`**: Determines if the current profile belongs to the user by comparing stored usernames.
- **`addFriend(username)`**: Adds a friend to the list and saves it in Chrome storage.
- **`removeFriend(username)`**: Removes a friend from the list and updates Chrome storage.
- **`updateFriendsList()`**: Updates the friends list in the popup interface and sorts it alphabetically.

## Contributing

Feel free to submit issues and pull requests if you have improvements or fixes. To contribute, please fork the repository and create a pull request with your changes.

## Contact

For questions or support, please open an issue in the repository or contact [sidjiyani2003@example.com](mailto:sidjiyani2003@example.com).
