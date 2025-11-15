// Presence manager: rotates activities and supports a custom status.
import { ActivityType } from 'discord.js';

export function startPresence(client){
  if(!client.context) client.context = {};
  if(client.context._presenceTimer){
    clearInterval(client.context._presenceTimer);
    client.context._presenceTimer = null;
  }
  const rotate = () => {
    const guilds = client.guilds.cache.size;
    const users = client.users.cache.size;
    const custom = client.context.customStatus;
    const customActivity = client.context.customActivity; // { name, type, url }
    const status = client.context.customPresenceStatus || 'online';
    const activities = [
      customActivity ? customActivity : null,
      custom ? { name: custom, type: ActivityType.Playing } : null,
      { name: '/help for commands', type: ActivityType.Listening },
      { name: `${guilds} servers | ${users} users`, type: ActivityType.Watching },
    ].filter(Boolean);
    const idx = client.context._presenceIndex || 0;
    const next = activities[idx % activities.length];
    try {
      client.user.setPresence({ activities: [next], status });
    } catch {}
    client.context._presenceIndex = (idx + 1) % activities.length;
  };
  rotate();
  client.context._presenceTimer = setInterval(rotate, 15000);
}

export function setCustomStatus(client, text){
  client.context = client.context || {};
  client.context.customStatus = text && text.trim().length ? text.trim() : undefined;
  // trigger an immediate update
  if(client.user) {
    client.context._presenceIndex = 0;
    const status = client.context.customPresenceStatus || 'online';
    try { client.user.setPresence({ activities: [{ name: client.context.customStatus || '/help for commands', type: client.context.customStatus ? ActivityType.Playing : ActivityType.Listening }], status }); } catch {}
  }
}

export function setPresenceStatus(client, status){
  client.context = client.context || {};
  client.context.customPresenceStatus = status; // 'online' | 'idle' | 'dnd' | 'invisible'
  if(client.user){
    try {
      const current = client.user.presence?.activities?.[0] || { name: '/help for commands', type: ActivityType.Listening };
      client.user.setPresence({ activities: [current], status });
    } catch {}
  }
}

export function setCustomActivity(client, type, name, url){
  // type: 'playing' | 'listening' | 'watching' | 'streaming'
  client.context = client.context || {};
  const map = { playing: ActivityType.Playing, listening: ActivityType.Listening, watching: ActivityType.Watching, streaming: ActivityType.Streaming };
  const t = map[type] ?? ActivityType.Playing;
  const activity = { name, type: t };
  if(t === ActivityType.Streaming && url) activity.url = url;
  client.context.customActivity = activity;
  if(client.user){
    const status = client.context.customPresenceStatus || 'online';
    try { client.user.setPresence({ activities: [activity], status }); } catch {}
  }
}
