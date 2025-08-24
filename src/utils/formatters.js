// estatecrm/src/utils/formatters.js

// Format a string to title case
export const formatToTitleCase = (str) => {
    // Return an empty string if the input is not a valid string
    if (!str || typeof str !== 'string') {
        return '';
    }

    return str
        .toLowerCase() // 1. Convert everything to lowercase: "relationship_manager"
        .replace(/_/g, ' ') // 2. Replace all underscores with spaces: "relationship manager"
        .split(' ') // 3. Split into an array of words: ['relationship', 'manager']
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // 4. Capitalize the first letter of each word: ['Relationship', 'Manager']
        .join(' '); // 5. Join them back with a space: "Relationship Manager"
};