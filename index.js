const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
});

const TOKEN = process.env.TOKEN;
const RAID_CHANNEL_ID = '1442462835866341467';  // 🔥 업데이트 완료

// 출발 알림 메시지
const DEPARTURE_MESSAGE = '@everyone 🚀 곧 출발합니다! 준비해주세요!';

client.once('ready', () => {
  console.log(`${client.user.tag} login success!`);

  // 매일 오후 4시 투표 알림
  cron.schedule('0 16 * * *', async () => {
    try {
      const channel = await client.channels.fetch(RAID_CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor(0xffc140)
        .setTitle('⚔️ 오늘 밤 10시 일일 레이드')
        .setDescription('오늘 **밤 10시 일일 레이드** 가실 분?')
        .addFields(
          { name: '👍 참여', value: '0명', inline: true },
          { name: '👎 불참', value: '0명', inline: true },
        )
        .setTimestamp();

      const msg = await channel.send({
        content: '@everyone',
        embeds: [embed],
      });

      await msg.react('👍');
      await msg.react('👎');

      console.log('투표 알림 전송 완료!');
    } catch (err) {
      console.error('투표 알림 오류:', err);
    }
  }, {
    timezone: "Asia/Seoul"
  });

  // 매일 오후 9시 50분 출발 알림
  cron.schedule('50 21 * * *', async () => {
    try {
      const channel = await client.channels.fetch(RAID_CHANNEL_ID);
      if (!channel) return;

      await channel.send(DEPARTURE_MESSAGE);

      console.log('출발 알림 전송 완료!');
    } catch (err) {
      console.error('출발 알림 오류:', err);
    }
  }, {
    timezone: "Asia/Seoul"
  });
  
});

client.login(TOKEN);
