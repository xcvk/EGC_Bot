const { SlashCommandBuilder ,
    ComponentType,
    EmbedBuilder} = require("discord.js");

const make_dice = require('./dice/dice.js');
const make_items = require('./item/item.js');
const make_other = require('./other/other.js');
const make_embed = require('./embed/embeds.js');
const checkValueExist = require('../../database/exist.js');
const insert = require('../../database/insert.js');

module.exports = {
data: new SlashCommandBuilder()
.setName('小鹿向前冲')
.setDescription('向前冲！！'),



async execute(interaction) {
    await interaction.deferReply();
    try {
      // Use await to wait for the result of checkValueExist
      const exists = await new Promise((resolve, reject) => {
        checkValueExist('player', 'id', `${interaction.user.username}`, (err, exists) => {
          if (err) {
            console.error('Error in checkValueExist function:', err);
            reject(err);
          } else {
            resolve(exists);
          }
        });
      });

      // Check if the value exists
      if (!exists) {
        // Use await to wait for the result of insert
        await new Promise((resolve, reject) => {
          insert(`${interaction.user.username}`, (err) => {
            if (err) {
              console.error('Error in insert function:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }

      // Use await to wait for the result of make_embed
      const res = await make_embed(interaction);

      // Continue with the rest of your code...
      const embed = new EmbedBuilder()
        .setTitle('你的小鹿在这')
        .setDescription(`嘿， 亲爱的 ${interaction.user.username} 我们冲吧！！`)
        .addFields(
          { name: '骰子', value: `${res[0].DICE}`, inline: true },
          { name: '步数', value: `${res[0].STEPS}`, inline: true },
          { name: '队伍', value: res[0].TEAM, inline: true },
        )
        .setColor('Random')
        .setAuthor({ name: `${interaction.user.username}` });

      const reply = interaction.reply({
        embeds: [embed],
        components: [make_dice(), make_items(), make_other()],
      });

      const filter = (i) => i.user.id === interaction.member.id;
      const collector = reply.createMessageComponentCollector({
        ComponentType: ComponentType.Button,
        filter,
      });

      collector.on('collect', (i) => {
        if (i.customId === '单颗使用') {
          i.reply('yo');
          return;
        }
      });

    } catch (e) {
      console.error('Error in execute function:', e);
    }
  },
};