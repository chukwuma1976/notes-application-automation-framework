//Generates unique note data for a given category
export function generateNotesData(category: string) {
    const timestamp = Date.now();
    return {
        category: category,
        title: `Note for ${category}, ID: ${timestamp}`,
        description: `Description for note in category ${category}, ID: ${timestamp}`
    }
}