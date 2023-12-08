const { EmbedBuilder } = require("discord.js");
const single_use = require("./single_use");
const pool = require("../../../database/db-promise");

async function multi_use(origin,interaction, current) {
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setDescription("请输入你一次想要用多少骰子");
  await interaction.reply({ embeds: [embed], ephemeral: true });

  const filter = (msg) => msg.author.id === interaction.user.id;

  try {
    // Await user's response
    const collected = await interaction.channel.awaitMessages({
      filter,
      max: 1,
      time: 10000, // You may adjust the time limit in milliseconds
      errors: ["time"],
    });

    const amount = parseInt(collected.first().content);

    if (!isNaN(amount) && amount <= current) {
      // Perform the single-use action for each dice roll
      let dice = 0;
      for (let iter = 0; iter < amount; ++iter) {

        [dice] = await pool.execute(
          `SELECT DICE FROM PLAYER WHERE id = ?`,
          [interaction.user.id]
        );

        if (dice[0].DICE <= 0)
        {
          break;
        }
        await single_use(origin,interaction, false);
      }
      return;
    } else {
      const embed2 = new EmbedBuilder()
        .setColor("Red")
        .setDescription("骰子不足");

      await interaction.followUp({ embeds: [embed2], ephemeral: true });
    }
  } catch (error) {
    // Handle timeout here
    const embed3 = new EmbedBuilder()
      .setColor("Yellow")
      .setDescription("操作超时");

    await interaction.followUp({ embeds: [embed3], ephemeral: true });
  }
}

module.exports = multi_use;