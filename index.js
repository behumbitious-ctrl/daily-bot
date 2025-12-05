const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
} = require('discord.js');
const cron = require('node-cron');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions, // 리액션 이벤트용
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// 🔐 Render 환경변수(TOKEN) 사용
const TOKEN = process.env.TOKEN;

// 레이드 투표를 올릴 채널 ID
const RAID_CHANNEL_ID = '1442138526790586452';

// 마지막 투표 메시지 ID (실시간 카운트 업데이트용)
let lastPollMessageId = null;

/**
 * 현재 메시지의 👍/👎 리액션 수를 읽어서
 * 임베드를 업데이트하는 함수
 */
async function updatePollEmbed(message) {
  try {
    // 필요하면 메시지 전체 정보 가져오기
    if (message.partial) {
      message = await message.fetch();
    }

    // 현재 리액션 상태 가져오기
    const upReaction = message.reactions.cache.get('👍');
    const downReaction = message.reactions.cache.get('👎');

    let upCount = upReaction?.count || 0;
    let downCount = downReaction?.count || 0;

    // 봇이 처음에 추가한 👍, 👎 1개씩 제외
    if (upCount > 0) upCount -= 1;
    if (downCount > 0) downCount -= 1;

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('⚔️ 오늘 밤 10시 일일 레이드')
      .setDescription('오늘 **밤 10시 일일 레이드** 가실 분?')
      .addFields(
        { name: '👍 참여', value: `${upCount}명`, inline: true },
        { name: '👎 불참`, value: `${downCount}명`, inline: true },
      )
      .setTimestamp();

    // @everyone 멘션 + 임베드 수정
    await message.edit({
      content: '@everyone',
      embeds: [embed],
    });
  } catch (err) {
    console.error('투표 임베드 업데이트 중 오류:', err);
  }
}

client.once('ready', () => {
  console.log(`${client.user.tag} login success!`);

  // ⏰ 매일 오후 4시 (16:00) 레이드 투표 올리기
  cron.schedule(
    '42 0 * * *',
    async () => {
      try {
        const channel = await client.channels.fetch(RAID_CHANNEL_ID);
        if (!channel) {
          console.error('채널을 찾을 수 없습니다. 채널 ID를 확인하세요.');
          return;
        }

        // 임베드 기본 상태(0명/0명)로 메시지 전송
        const embed = new EmbedBuilder()
          .setColor(0xf1c40f)
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

        // 투표용 리액션 추가
        await msg.react('👍');
        await msg.react('👎');

        // 마지막 투표 메시지 기억
        lastPollMessageId = msg.id;
      } catch (err) {
        console.error('레이드 투표 생성 중 오류:', err);
      }
    },
    { timezone: 'Asia/Seoul' }
  );
});

// 👍/👎 리액션 추가될 때마다 임베드 업데이트
client.on('messageReactionAdd', async (reaction, user) => {
  try {
    if (user.bot) return;

    if (reaction.message.partial) {
      await reaction.message.fetch();
    }

    if (reaction.message.channelId !== RAID_CHANNEL_ID) return;
    if (reaction.message.id !== lastPollMessageId) return;
    if (!['👍', '👎'].includes(reaction.emoji.name)) return;

    await updatePollEmbed(reaction.message);
  } catch (err) {
    console.error('리액션 추가 처리 중 오류:', err);
  }
});

// 리액션 제거될 때도 임베드 업데이트
client.on('messageReactionRemove', async (reaction, user) => {
  try {
    if (user.bot) return;

    if (reaction.message.partial) {
      await reaction.message.fetch();
    }

    if (reaction.message.channelId !== RAID_CHANNEL_ID) return;
    if (reaction.message.id !== lastPollMessageId) return;
    if (!['👍', '👎'].includes(reaction.emoji.name)) return;

    await updatePollEmbed(reaction.message);
  } catch (err) {
    console.error('리액션 제거 처리 중 오류:', err);
  }
});

client.login(TOKEN);
