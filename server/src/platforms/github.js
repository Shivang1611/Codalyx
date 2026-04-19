/**
 * Production-grade GitHub Platform Scraper
 * Fetches user profile, repositories, and activity using the GitHub REST API.
 */

function getLanguageColor(lang) {
  const colors = {
    'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5', 'Java': '#b07219',
    'C++': '#f34b7d', 'PHP': '#4F5D95', 'Ruby': '#701516', 'Go': '#00ADD8', 'Rust': '#dea584',
    'Swift': '#F05138', 'Kotlin': '#A97BFF', 'HTML': '#e34c26', 'CSS': '#563d7c', 'C#': '#178600'
  }
  return colors[lang] || '#6e7681'
}

export async function fetchGitHubStats(username) {
  const headers = { 
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Codalyx-App'
  }
  
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
  }

  try {
    // 1. Fetch User Profile
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userRes.ok) {
       if (userRes.status === 404) throw new Error('GitHub user not found');
       throw new Error('GitHub API error: ' + userRes.statusText);
    }
    const userData = await userRes.json();

    // 2. Fetch Repositories
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });
    const reposData = await reposRes.json();

    // 3. Process Data
    let totalStars = 0;
    let forksCount = 0;
    const languages = {};
    const allRepos = [];
    const recentRepos = [];

    reposData.forEach(repo => {
      totalStars += repo.stargazers_count;
      forksCount += repo.forks_count;
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
      
      const repoInfo = {
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        isFork: repo.fork,
        updatedAt: repo.updated_at
      };

      allRepos.push(repoInfo);
      if (!repo.fork && recentRepos.length < 6) {
        recentRepos.push(repoInfo);
      }
    });

    // 4. Languages Distribution
    const totalReposWithLang = Object.values(languages).reduce((a, b) => a + b, 0);
    const topLanguages = Object.entries(languages)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / totalReposWithLang) * 100),
        color: getLanguageColor(name)
      }))
      .sort((a,b) => b.percentage - a.percentage);

    // 5. Fetch Activity Events
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=50`, { headers });
    const eventsData = await eventsRes.json();
    
    const activityStats = {
      commits: eventsData.filter(e => e.type === 'PushEvent').reduce((acc, e) => acc + (e.payload.commits?.length || 0), 0),
      prs: eventsData.filter(e => e.type === 'PullRequestEvent').length,
      reviews: eventsData.filter(e => e.type === 'PullRequestReviewEvent').length,
      issues: eventsData.filter(e => e.type === 'IssuesEvent').length,
    };

    const recentSubmissions = eventsData
      .filter(event => event.type === 'PushEvent' || event.type === 'PullRequestEvent')
      .map(event => ({
        id: event.id,
        title: event.type === 'PushEvent' 
          ? `Committed to ${event.repo.name.split('/')[1]}`
          : `Opened PR in ${event.repo.name.split('/')[1]}`,
        difficulty: event.type === 'PushEvent' ? 'Medium' : 'Hard',
        topic: 'GitHub Activity',
        accuracy: 100,
        attempts: event.payload.commits?.length || 1,
        timestamp: new Date(event.created_at),
        status: event.type === 'PushEvent' ? 'Pushed' : 'Proposed'
      }));

    return {
      username: userData.login,
      totalQuestions: userData.public_repos,
      solvedQuestions: userData.public_repos,
      accuracy: 100,
      streak: 0,
      githubData: {
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        totalStars,
        forksCount,
        topLanguages,
        recentRepos,
        allRepos,
        activityStats,
        avatarUrl: userData.avatar_url
      },
      recentSubmissions
    };
  } catch (err) {
    console.error('GitHub fetch failed:', err);
    throw err;
  }
}
