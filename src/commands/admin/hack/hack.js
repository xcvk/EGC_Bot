const {EmbedBuilder} = require("discord.js");
const translation = require("../../../database/translation");
const pool = require("../../../database/db-promise");

async function add(id, item,amount,interaction) {

  const updateQuery = `UPDATE PLAYER SET ${item} = ${item} + ${amount} WHERE id = ?`;

  if (item === "STEPS") {
    let [team] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`,[id]);
    if (team[0].TEAM === "红") {
      team = "RED_STEPS";
    } else {
      team = "BLUE_STEPS";
    }
    await pool.execute(`UPDATE TEAMS SET ${team} = ${team} + ${amount} WHERE LINE = 1`);
  }
  await pool.execute(updateQuery, [id]);


  const embed = new EmbedBuilder()
  .setDescription(`已对 <@${id}> 添加了 ${amount}个 ${translation.get(item)}!`)
  .setColor("Green");
  await interaction.editReply({embeds:[embed]});

}


async function subtract(id,item,amount,interaction) {
  const updateQuery = `UPDATE PLAYER SET ${item} = ${item} - ${amount} WHERE id = ?`;
  await pool.execute(updateQuery, [id]);
  if (item === "STEPS") {
    const [team] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`, [
      id,
    ]);
    if (team[0].TEAM === "红") {
      team = "RED_STEPS";
    } else {
      team = "BLUE_STEPS";
    }
    await pool.execute(`UPDATE TEAMS SET ${team} = ${team} - ${amount} WHERE LINE = 1`);
  }
  const embed = new EmbedBuilder()
    .setDescription(`已对 <@${id}> 减少了 ${amount}个 ${translation.get(item)}!`)
    .setColor("Green");
  await interaction.editReply({ embeds: [embed] });

}

module.exports = {add,subtract};