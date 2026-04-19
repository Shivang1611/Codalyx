import { fetchLeetCodeStats } from './leetcode.js';

async function test() {
  try {
    const res = await fetchLeetCodeStats('shivangshukla__001');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
