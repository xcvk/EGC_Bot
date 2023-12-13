const { EmbedBuilder } = require("discord.js");
const pool = require("../../../database/db-promise");

async function nothing(interaction, steps, rep) {
  const [results] = await pool.execute(
    `SELECT STEPS, DICE FROM PLAYER WHERE ID = ?`,
    [interaction.user.id]
  );

  const embed = new EmbedBuilder()
    .setDescription(
      `消耗了一颗骰子\n\n
            **前进了__${steps}__步**
            **还剩__${results[0].DICE}__颗骰子**
            **总共走了__${results[0].STEPS}__步**`
    )
    .setColor("White")
    .setTitle("无事发生");
  if (rep) {
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } else {
    await interaction.followUp({ embeds: [embed], ephemeral: true });
  }
}

module.exports = nothing;
