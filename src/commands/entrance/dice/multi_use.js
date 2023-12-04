const { EmbedBuilder } = require('discord.js');
const single_use = require('./single_use');
async function multi_use(interaction, current) {
    const embed = new EmbedBuilder()
        .setColor("Green")
        .setDescription("请输入你一次想要用多少骰子");
    await interaction.reply({ embeds: [embed], ephemeral: true });

    const filter = (msg) => msg.author.id === interaction.user.id;

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
        for (let iter = 0; iter < amount; ++iter) {
            single_use(interaction,false);
            await new Promise((resolve) => setTimeout(resolve, 400));
        }
        return;
    } else {
      const embed2 = new EmbedBuilder()
        .setColor("Red")
        .setDescription("骰子不足");

        await interaction.followUp({ embeds: [embed2], ephemeral: true });
    }
}

module.exports = multi_use;