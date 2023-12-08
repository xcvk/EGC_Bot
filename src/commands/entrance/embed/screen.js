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
    })
    .setImage(
      "https://cdn.discordapp.com/attachments/1180814394259685398/1182305294353715221/xiaoye8.png?ex=6584369c&is=6571c19c&hm=540173654eb401671d30acafcc7a890c8f27a5486aab822553f8b26a6bf9cb68&"
    );

  await interaction.editReply({ embeds: [embed] });
}

module.exports = update;
