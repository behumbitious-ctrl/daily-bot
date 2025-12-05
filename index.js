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
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const TOKEN = process.env.TOKEN;
const RAID_CHANNEL_ID = '1442462835866341467';
let lastPollMessageId = null;

async function updatePollEmbed(message) {
  try {
    if (message.partial) message = await message.fetch();

    const upReaction = message.reactions.cache.get('👍');
    const downReaction = message.reactions.cache.get('👎');

    let upCount = (upReaction?.count || 0) - 1;
    let downCount = (downReaction?.count || 0) - 1;
    if (upCount < 0) upCount = 0;
    if (downCount < 0) downCount = 0;

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('⚔️ 오늘 밤 10시 일일 레이드')
      .setDescription('오늘 **밤 10시 일일 레이드** 가실 분?')
      .addFields(
        { name: '👍 참여', value: `${upCount}명`, inline: true },
        { name: '👎 불참', value: `${downCount}명`, inline: true }, // ← 고친 부분
      )
      .setTimestamp();

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

  cron.schedule(
    '55 12 * * *',
    async () => {
      try {
        const channel = await client.channels.fetch(RAID_CHANNEL_ID);
        if (!channel) return;

        const embed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle('⚔️ 오늘 밤 10시 일일 레이드')
          .setDescription('오늘 **밤 10시 일일 레이드** 가실 분?')
          .addFields(
            { name: '👍 참여', value: '0명', inline: true },
            { name: '👎 불참', value: '0명', inline: true }, // ← 고친 부분
          )
          .setTimestamp();

        const msg = await channel.send({
          content: '@everyone',
          embeds: [embed],
        });

        await msg.react('👍');
        await msg.react('👎');

        lastPollMessageId = msg.id;
      } catch (err) {
        console.error('레이드 투표 생성 중 오류:', err);
      }
    },
    { timezone: 'Asia/Seoul' }
  );
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.id !== lastPollMessageId) return;
  if (!['👍', '👎'].includes(reaction.emoji.name)) return;
  await updatePollEmbed(reaction.message);
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.id !== lastPollMessageId) return;
  if (!['👍', '👎'].includes(reaction.emoji.name)) return;
  await updatePollEmbed(reaction.message);
});

client.login(TOKEN);
