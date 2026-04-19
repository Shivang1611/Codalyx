// TODO: CodeChef requires OAuth/API keys for detailed stats.
// Return placeholder data until official configuration is provided.

export async function fetchCodechefStats(username) {
  console.warn('CodeChef API not yet configured for:', username)
  return {
    totalQuestions:  0,
    solvedQuestions: 0,
    accuracy:        0,
    streak:          0,
    weakAreas:       [
      { topic: 'Data Structures', accuracy: 0, attempts: 0, priority: 'medium' },
      { topic: 'Algorithms', accuracy: 0, attempts: 0, priority: 'medium' }
    ],
    // TODO: implement with CodeChef OAuth once credentials are provided
  }
}
