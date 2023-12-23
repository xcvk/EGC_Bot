const {EmbedBuilder} = require("discord.js");
const translation = require("../../../database/translation");
const pool = require("../../../database/db-promise");





async function add(id, item,amount,interaction) {
  const [blue_member] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
  const [red_member] = await pool.execute("SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1");

  let date = new Date();


  if ((!blue_member[0].BLUE_MEMBERS || !blue_member[0].BLUE_MEMBERS.includes(id)) && 
      (!red_member[0].RED_MEMBERS || !red_member[0].RED_MEMBERS.includes(id))) {
    const embed = new EmbedBuilder()
    .setDescription(`没有 <@${id}> 这个人。。确认这个玩家有没有注册或者有没有打错名了!`)
    .setColor("Red");
    await interaction.editReply({ embeds: [embed]});
    await pool.execute(
      `UPDATE TEAMS
      SET ADMIN_HISTORY = JSON_ARRAY_APPEND(IFNULL(ADMIN_HISTORY, '[]'), '$', '添加错误 ${date.getMonth() + 1}月${date.getDate()}日${date.getHours()}时${date.getMinutes()}分')
      WHERE LINE = 1;`
    );
    return;
  }



  const updateQuery = `UPDATE PLAYER SET ${item} = ${item} + ${amount} WHERE id = ?`;


  await pool.execute(
    `UPDATE TEAMS
      SET ADMIN_HISTORY = JSON_ARRAY_APPEND(IFNULL(ADMIN_HISTORY, '[]'), '$', '为<@${id}> 添加了${amount}个${translation.get(item)} ${date.getMonth() + 1}月${date.getDate()}日${date.getHours()}时${date.getMinutes()}分')
      WHERE LINE = 1;`
  );





  if (item === "STEPS") {
    let [team] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`,[id]);
    if (team[0].TEAM === "红") {
      team = "RED_STEPS";
    } else {
      team = "BLUE_STEPS";
    }
    await pool.execute(`UPDATE TEAMS SET ${team} = ${team} + ${amount} WHERE LINE = 1`);
  }
  if (item === "SWAP") {
    const [player] = await pool.execute(`SELECT SWAP FROM PLAYER WHERE ID = ?`,[id]);
    await pool.execute(
      `UPDATE PLAYER
      SET SWAP = JSON_SET(SWAP, '$[0]', ${amount}, '$[1]',' ${player[0].SWAP[1]}')
      WHERE ID = ?;`,
      [id]
    );
  } else {
    await pool.execute(updateQuery, [id]);
  }
  
  const embed = new EmbedBuilder()
  .setDescription(`已对 <@${id}> 添加了 ${amount}个 ${translation.get(item)}!`)
  .setColor("Green");
  await interaction.editReply({embeds:[embed],ephemeral: true});

}


async function subtract(id,item,amount,interaction) {

  const [blue_member] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
  const [red_member] = await pool.execute("SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1");
  if ((!blue_member[0].BLUE_MEMBERS || !blue_member[0].BLUE_MEMBERS.includes(id)) && 
      (!red_member[0].RED_MEMBERS || !red_member[0].RED_MEMBERS.includes(id))) {
    const embed = new EmbedBuilder()
    .setDescription(`没有 <@${id}> 这个人。。确认这个玩家有没有注册或者有没有打错名了!`)
    .setColor("Red");
    await interaction.editReply({ embeds: [embed]});
    await pool.execute(
      `UPDATE TEAMS
      SET ADMIN_HISTORY = JSON_ARRAY_APPEND(IFNULL(ADMIN_HISTORY, '[]'), '$', '减少错误 ${date.getMonth() + 1}月${date.getDate()}日${date.getHours()}时${date.getMinutes()}分')
      WHERE LINE = 1;`
    );
    return;
  }
  let date = new Date();


  const updateQuery = `UPDATE PLAYER SET ${item} = ${item} - ${amount} WHERE id = ?`;
  await pool.execute(
    `UPDATE TEAMS
      SET ADMIN_HISTORY = JSON_ARRAY_APPEND(IFNULL(ADMIN_HISTORY, '[]'), '$', '为<@${id}> 减少了${amount}个${translation.get(item)} ${date.getMonth() + 1}月${date.getDate()}日${date.getHours()}时${date.getMinutes()}分')
      WHERE LINE = 1;`
  );

  await pool.execute(updateQuery, [id]);
  if (item === "STEPS") {
    let [team] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`, [
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
  await interaction.editReply({ embeds: [embed],ephemeral: true});

}

module.exports = {add,subtract};