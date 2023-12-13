const pool = require("../../../database/db-promise");
const {EmbedBuilder} = require("discord.js");

async function check_prizes(interaction) {
    const [inventory] = await pool.execute("SELECT PRIZES FROM PLAYER WHERE ID = ?",[interaction.user.id]);
    let content = "";
    
    let dict = new Map();
    if (!inventory[0].PRIZES) {
        content = "无";
    } else {
        for (let i = 0; i < inventory[0].PRIZES.length; ++i) {
            if (!dict.has(inventory[0].PRIZES[i])) {
                dict.set(inventory[0].PRIZES[i],0);
            }
            dict.set(inventory[0].PRIZES[i],dict.get(inventory[0].PRIZES[i]) + 1);
        }
    }

    for (const [key, value] of dict) {
        
        content += `${key}: ${value}个\n`;
    }

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("我的奖品")
      .setDescription(content)
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`,
    })
    ;
    await interaction.reply({embeds: [embed],ephemeral: true});
}


module.exports = check_prizes;