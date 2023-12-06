const { EmbedBuilder } = require("discord.js");
const pool = require("../../../database/db-promise");

async function update(interaction) {
  const [res] = await pool.execute(
    `SELECT STEPS, TEAM, DICE FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );
  let color = null;
  let flag = null;
  if (res[0].TEAM === "蓝") {
    color = "Blue";
    flag = "🟦";
  } else {
    flag = "🟥";
    color = "Red";
  }
  // Continue with the rest of your code...

  
  const query = `SELECT RED_STEPS, BLUE_STEPS FROM TEAMS;`;




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
      text: `🟦蓝队一共走了:${stepz[0].BLUE_STEPS}步\n🟥红队一共走了:${stepz[0].RED_STEPS}步`,
    });

  await interaction.editReply({ embeds: [embed] });
}

module.exports = update;
