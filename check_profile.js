import mongoose from 'mongoose';
import Profile from './server/src/models/Profile.js';
import WeakArea from './server/src/models/WeakArea.js';
import { connectDB } from './server/src/config/db.js';
import { fetchLeetCodeStats } from './server/src/platforms/leetcode.js';
import { fetchCodeforcesStats } from './server/src/platforms/codeforces.js';

async function syncProfileStats(profile) {
  let stats;
  if (profile.platform === 'LEETCODE')
    stats = await fetchLeetCodeStats(profile.username);
  else if (profile.platform === 'CODEFORCES')
    stats = await fetchCodeforcesStats(profile.username);
  else
    stats = await fetchCodechefStats(profile.username);

  Object.assign(profile, {
    totalQuestions:  stats.totalQuestions || 0,
    solvedQuestions: stats.solvedQuestions || 0,
    accuracy:        stats.accuracy || 0,
    streak:          stats.streak || 0,
    recentSubmissions: stats.recentSubmissions || [],
    lastSyncedAt:    new Date(),
  });
  await profile.save();

  // Replace weakAreas
  await WeakArea.deleteMany({ profileId: profile._id });
  if (stats.weakAreas?.length) {
    await WeakArea.insertMany(
      stats.weakAreas.map(w => ({ ...w, profileId: profile._id }))
    );
  }

  const weakAreas = await WeakArea.find({ profileId: profile._id });
  return { ...profile.toObject(), weakAreas };
}

async function run() {
  await connectDB();
  const profile = await Profile.findById('69e3b0340945ee8ad989d1af');
  if (!profile) {
    console.log('Profile not found.');
    return;
  }
  
  console.log('Refreshing profile:', profile.username, profile.platform);
  const synced = await syncProfileStats(profile);
  console.log('recentSubmissions count:', synced.recentSubmissions?.length);
  process.exit(0);
}
run();
