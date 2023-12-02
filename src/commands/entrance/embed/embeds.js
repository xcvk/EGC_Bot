const { EmbedBuilder } = require('discord.js');
const pool = require('../../../database/db.js');
const {db,db_host,db_password,db_username} = require('../../../config.json');





 function make_embed(interaction) {
  
  const userData = pool.query(`SELECT STEPS, TEAM, DICE FROM PLAYER WHERE id = ?`, [interaction.user.username]);
  console.log(`line 32 : ${userData}`);
  const embed = new EmbedBuilder()
    .setTitle('你的小鹿在这')
    .setDescription(`嘿， 亲爱的 ${interaction.user.username} 我们冲吧！！`)
    .addFields(
      { name: '骰子', value:'1', inline: true },
      { name: '步数', value: '1', inline: true },
      { name: '队伍', value:'1', inline: true },
    )
    .setColor('Random')
    .setAuthor({ name: `${interaction.user.username}` });

  return embed;
  
}

module.exports = make_embed;