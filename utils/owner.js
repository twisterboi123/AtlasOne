export function isOwner(userId){
  const owner = process.env.BOT_OWNER_ID;
  if(!owner) return false;
  return userId === owner;
}
