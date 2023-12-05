const make_embed = require("./embeds");
const {EmbedBuilder} = require("discord.js");
const get_steps = require("../../../database/total_step");


async function update(interaction) {
  const res = await make_embed(interaction);
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
  const stepz = await get_steps();
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
      text: `🟦蓝队一共走了:${stepz[0].BLUE_STEPS}步                                                🟥红队一共走了:${stepz[0].RED_STEPS}步`,
    });
    
    await interaction.editReply({embeds:[embed]});
}

module.exports = update;