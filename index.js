const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

client.once('ready', () => {
  console.log(`${client.user.tag} login success!`);

  cron.schedule('0 22 * * *', () => {
    const channel = client.channels.cache.get('1442138526790586452');
    if (channel) {
      channel.send('@everyone 📢 밤 10시 일일레이드 참석여부 알림! 확인해주세요 👇');
    }
  }, {
    timezone: "Asia/Seoul"
  });
});

client.login(TOKEN);