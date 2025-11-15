// Basic leveling system helpers.
export function xpForNext(level){
  return (level + 1) * (level + 1) * 100; // quadratic scaling
}

export function addXp(userData, userId, amount){
  if(!userData[userId]) userData[userId] = { xp:0, level:0 };
  const u = userData[userId];
  u.xp += amount;
  let leveled = false;
  while(u.xp >= xpForNext(u.level)){
    u.level++;
    leveled = true;
  }
  return { ...u, leveled };
}

export function leaderboard(userData, limit=10){
  return Object.entries(userData)
    .map(([id,v])=>({ id, xp:v.xp, level:v.level }))
    .sort((a,b)=>b.xp - a.xp)
    .slice(0, limit);
}
