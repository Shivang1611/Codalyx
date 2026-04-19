export async function fetchHackerrankStats(username) {
  // Free API/Scraper mock for HackerRank
  return {
    totalQuestions: 1500,
    solvedQuestions: Math.floor(Math.random() * 200) + 20,
    accuracy: Math.floor(Math.random() * 30) + 65,
    streak: Math.floor(Math.random() * 10),
    recentSubmissions: [
      { id: 'hr1', title: 'Compare the Triplets', difficulty: 'Easy', topic: 'Implementation', status: 'Accepted', timestamp: new Date() }
    ],
    weakAreas: [
      { topic: 'Strings', accuracy: 50 },
      { topic: 'Sorting', accuracy: 55 }
    ]
  }
}
