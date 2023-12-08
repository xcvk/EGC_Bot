const { EmbedBuilder } = require("discord.js");
const pool = require("../../../database/db-promise");
async function item_hist(interaction) {

    const [test] = await pool.execute(
      `SELECT ITEM_HISTORY FROM PLAYER WHERE ID = ?`
    ,[interaction.user.id]);

    let res = "";
    const history = test[0].ITEM_HISTORY;
    for (let i = 0; i < history.length; ++i) {
        res.concat(`${history[i]}\n`);
    }
    

    const embed = new EmbedBuilder()
      .setDescription(`**我的道具历史**\n${res}`)
      .setColor("White")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`,
      });



    await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = item_hist;
