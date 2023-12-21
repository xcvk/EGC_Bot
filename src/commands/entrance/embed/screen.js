const { EmbedBuilder } = require("discord.js");
const pool = require("../../../database/db-promise");

async function update(interaction) {
  const [res] = await pool.execute(
    `SELECT STEPS, TEAM, DICE FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  let image = "";
  let color = null;
  let flag = null;
  if (res[0].TEAM === "蓝") {
    color = "Blue";
    flag = "🟦";
    image = "https://cdn.discordapp.com/attachments/1130908254365556787/1186142398947020890/image.png?ex=65922c31&is=657fb731&hm=f780391efb1c8f24b6636e0596e3dcc51161e3903e2a117d45129d9733a16341&";
  } else {
    flag = "🟥";
    color = "Red";
    image = "https://cdn.discordapp.com/attachments/1130908254365556787/1186142530685907035/image.png?ex=65922c50&is=657fb750&hm=f4de8502e8fe88fbd38ea11167dd4e173c6ce90010d3ca29c4b07e26ce5f82d5&";
  }
  // Continue with the rest of your code...

  const query = `SELECT RED_STEPS, BLUE_STEPS,MULTIPLIER_BLUE,MULTIPLIER_RED FROM TEAMS;`;
  const [buffs] = await pool.execute(`SELECT BUFFS FROM PLAYER WHERE ID = ?`,[interaction.user.id]);
  let buff = "";

  
  if (buffs[0].BUFFS.BOOTS > 0) {
    buff += `跑鞋： ${buffs[0].BUFFS.BOOTS}\n`;
  }
  if (buffs[0].BUFFS.EXPLORER > 0) {
    buff += `探宝专家： ${buffs[0].BUFFS.EXPLORER}\n`;
  }
  if (buffs[0].BUFFS.SPELL_SHIELD > 0) {
    buff += `无懈可击： ${buffs[0].BUFFS.SPELL_SHIELD}\n`;
  }
  if (buffs[0].BUFFS.EFFECT_DOUBLE > 0) {
    buff += `双份体验： ${buffs[0].BUFFS.EFFECT_DOUBLE}\n`;
  }
  if (buff.length > 0) {
    buff = "我的被动加成\n" + buff;
  }
  const [stepz] = await pool.execute(query);
  const embed = new EmbedBuilder()
    .setTitle("小鹿向前冲！！！")
    .setDescription(
      `嘿， 亲爱的 ${interaction.user.username} 我们为了${res[0].TEAM}队冲吧！！\n
        -------------------------------------------------------------`
    )
    .addFields(
      { name: "🎲骰子", value: `${res[0].DICE}`, inline: true },
      { name: "👣步数", value: `${res[0].STEPS}`, inline: true },
      { name: `${flag}队伍`, value: res[0].TEAM, inline: true }
    )
    .setColor(color)
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.avatarURL()}`,
    })
    .setFooter({
      text: `🟦蓝队一共走了:${stepz[0].BLUE_STEPS + 5000 * stepz[0].MULTIPLIER_BLUE}步\n🟥红队一共走了:${stepz[0].RED_STEPS + 5000 * stepz[0].MULTIPLIER_RED}步\n\n${buff}`,
    })
    .setImage(
      `${image}`
    );

  await interaction.editReply({ embeds: [embed] });
}

module.exports = update;
