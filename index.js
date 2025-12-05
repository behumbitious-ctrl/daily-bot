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

  // 🧪 테스트용: 오늘 00:20에 실행 (매일 0시 20분)
  cron.schedule('30 0 * * *', async () => {
    const channel = client.channels.cache.get('1442462835866341467');
    if (!channel) {
      console.error('채널을 찾을 수 없습니다. 채널ID 확인 필요');
      return;
    }

    // 👍👎 투표 메시지 전송
    const message = await channel.send(
      '@everyone ⚔️ 오늘 **밤 10시 일일 레이드** 가실 분?\n\n' +
      '👍 : 참여\n' +
      '👎 : 불참'
    );

    await message.react('👍');
    await message.react('👎');
  }, {
    timezone: "Asia/Seoul"
  });
});

client.login(TOKEN);