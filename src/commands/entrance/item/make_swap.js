const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

const pool = require("../../../database/db-promise");
const item_disp = require("./item_disp");
const { all } = require("async");




// SWAP ARRAY INDEX 1 IF VALUE IS 3 THEN TEAM IS BLUE AND IF VALUE IS 4 THEN TEAM IS RED
async function action(origin,interaction) {
    let [results] = await pool.execute(
      `SELECT SWAP, TEAM FROM PLAYER WHERE id = ?`,
      [interaction.user.id]
    );

    if (results[0].SWAP[0] <= 0) {
      const insufficent = new EmbedBuilder()
        .setDescription("交换生道具不足")
        .setColor("Red");
      await origin.followUp({ embeds: [insufficent],  });
      return;





    }
    const filter = (msg) => msg.author.id === interaction.user.id;
    try {
        const collected = await interaction.channel.awaitMessages({
          filter,
          max: 1,
          time: 60000,
          errors: ["time"],
        });


        const message = collected.first().content;
        const [curr_team] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`,[interaction.user.id]); 
        
        let search = null;

        const broken = message.substring(2,message.length - 1); 
        if (curr_team[0].TEAM === "红") {
          const [team] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
          search = team[0].BLUE_MEMBERS;
        } else {
          const [team] = await pool.execute("SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1");
          search = team[0].RED_MEMBERS;
        }

  
        if (message === "随机") {
          if (curr_team[0].TEAM === "红") {
            let [enemy_team] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
            let [ally_team] = await pool.execute(
              "SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1"
            );
            const loser = enemy_team[0].BLUE_MEMBERS[Math.floor(Math.random() * enemy_team[0].BLUE_MEMBERS.length)];
            if (results[0].SWAP[1] === 0) {
              await pool.execute(
                `UPDATE PLAYER
                  SET SWAP = JSON_SET(SWAP, '$[0]', ${results[0].SWAP[0]}, '$[1]', '红')
                  WHERE ID = ?;`,
                            [interaction.user.id]
              );
            }
            await pool.execute(`UPDATE PLAYER SET TEAM = '蓝' WHERE ID = ?`,[interaction.user.id]);
            await pool.execute(`UPDATE PLAYER SET TEAM = '红' WHERE ID = ?`, [
              loser,
            ]);
            const enemy_index = enemy_team[0].BLUE_MEMBERS.indexOf(loser);
            enemy_team[0].BLUE_MEMBERS.splice(enemy_index,1);
            enemy_team[0].BLUE_MEMBERS.push(interaction.user.id);
            const ally_index = ally_team[0].RED_MEMBERS.indexOf(interaction.user.id);
            ally_team[0].RED_MEMBERS.splice(ally_index,1);
            ally_team[0].RED_MEMBERS.push(loser);

            await pool.execute(
              `UPDATE TEAMS SET RED_MEMBERS = ${ally_team[0].RED_MEMBERS} WHERE LINE = 1`
            );
            await pool.execute(
              `UPDATE TEAMS SET BLUE_MEMBERS = ${enemy_team[0].BLUE_MEMBERS} WHERE LINE = 1`
            );
             const embed = new EmbedBuilder()
               .setDescription(`已和<@${loser}>换队成功！！`)
               .setAuthor({
                 name: `${interaction.user.username}`,
                 iconURL: `${interaction.user.avatarURL()}`,
               })
               .setColor("Green");
            await interaction.followUp({ embeds: [embed],ephemeral: false});
          } else {
            let [ally_team] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
            let [enemy_team] = await pool.execute(
              "SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1"
            );
            const loser =
              enemy_team[0].RED_MEMBERS[
                Math.floor(Math.random() * enemy_team[0].RED_MEMBERS.length)
              ];
            if (results[0].SWAP[1] === 0) {
              await pool.execute(
                `UPDATE PLAYER
                  SET SWAP = JSON_SET(SWAP, '$[0]', ${results[0].SWAP[0]}, '$[1]', '蓝')
                  WHERE ID = ?;`,
                [interaction.user.id]
              );
            }
            await pool.execute(`UPDATE PLAYER SET TEAM = '红' WHERE ID = ?`, [
              interaction.user.id,
            ]);
            await pool.execute(`UPDATE PLAYER SET TEAM = '蓝' WHERE ID = ?`, [
              loser,
            ]);
             const embed = new EmbedBuilder()
               .setDescription(`已和<@${loser}>换队成功！！`)
               .setAuthor({
                 name: `${interaction.user.username}`,
                 iconURL: `${interaction.user.avatarURL()}`,
               })
               .setColor("Green");
            const enemy_index = enemy_team[0].RED_MEMBERS.indexOf(loser);
            enemy_team[0].RED_MEMBERS.splice(enemy_index, 1);
            enemy_team[0].RED_MEMBERS.push(interaction.user.id);
            const ally_index = ally_team[0].BLUE_MEMBERS.indexOf(
              interaction.user.id
            );
            ally_team[0].BLUE_MEMBERS.splice(ally_index, 1);
            ally_team[0].BLUE_MEMBERS.push(loser);
            await pool.execute(
              "UPDATE TEAMS SET BLUE_MEMBERS = ? WHERE LINE = 1",
              [ally_team[0].BLUE_MEMBERS]
            );

            await pool.execute(
              "UPDATE TEAMS SET RED_MEMBERS = ? WHERE LINE = 1",
              [enemy_team[0].RED_MEMBERS]
            );
             await interaction.followUp({ embeds: [embed],ephemeral: false});
          }
        } else if (search.includes(broken)) {
          let their_team = null;
          let my_team = null;
          if (curr_team[0].TEAM === "蓝") {
            my_team = "红";
            their_team = "蓝";
            let [ally_team] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
            let [enemy_team] = await pool.execute("SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1");
            const enemy_index = enemy_team[0].RED_MEMBERS.indexOf(broken);
            enemy_team[0].RED_MEMBERS.splice(enemy_index, 1);
            enemy_team[0].RED_MEMBERS.push(interaction.user.id);
            const ally_index = ally_team[0].BLUE_MEMBERS.indexOf(
              interaction.user.id
            );
            ally_team[0].BLUE_MEMBERS.splice(ally_index, 1);
            ally_team[0].BLUE_MEMBERS.push(broken);
            await pool.execute(
              "UPDATE TEAMS SET BLUE_MEMBERS = ? WHERE LINE = 1",
              [ally_team[0].BLUE_MEMBERS]
            );

            await pool.execute(
              "UPDATE TEAMS SET RED_MEMBERS = ? WHERE LINE = 1",
              [enemy_team[0].RED_MEMBERS]
            );

          } else {
            my_team = "蓝";
            their_team = "红";
            let [ally_team] = await pool.execute(
              "SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1"
            );
            let [enemy_team] = await pool.execute(
              "SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1"
            );
            const enemy_index = enemy_team[0].BLUE_MEMBERS.indexOf(broken);
            enemy_team[0].BLUE_MEMBERS.splice(enemy_index, 1);
            enemy_team[0].BLUE_MEMBERS.push(interaction.user.id);
            const ally_index = ally_team[0].RED_MEMBERS.indexOf(
              interaction.user.id
            );
            ally_team[0].RED_MEMBERS.splice(ally_index, 1);
            ally_team[0].RED_MEMBERS.push(broken);
            await pool.execute(
              "UPDATE TEAMS SET RED_MEMBERS = ? WHERE LINE = 1",
              [ally_team[0].RED_MEMBERS]
            );

            await pool.execute(
              "UPDATE TEAMS SET BLUE_MEMBERS = ? WHERE LINE = 1",
              [enemy_team[0].BLUE_MEMBERS]
            );
          }


           if (results[0].SWAP[1] === 0) {
             await pool.execute(
               `UPDATE PLAYER
                  SET SWAP = JSON_SET(SWAP, '$[0]', ${results[0].SWAP[0]}, '$[1]', '${curr_team[0].TEAM}')
                  WHERE ID = ?;`,
               [interaction.user.id]
             );
           }
           await pool.execute(`UPDATE PLAYER SET TEAM = '${my_team}' WHERE ID = ?`, [
             interaction.user.id,
           ]);
           await pool.execute(`UPDATE PLAYER SET TEAM = '${their_team}' WHERE ID = ?`, [
             broken,
           ]);

           const embed = new EmbedBuilder()
             .setDescription(`已和<@${broken}>换队成功！！`)
             .setAuthor({
               name: `${interaction.user.username}`,
               iconURL: `${interaction.user.avatarURL()}`,
             })
             .setColor("Green");
             await interaction.followUp({embeds: [embed],ephemeral: false});

             
        } else {
          message.push(123);
        }
        await pool.execute(
          `UPDATE PLAYER
                  SET SWAP = JSON_SET(SWAP, '$[0]', ${results[0].SWAP[0] - 1}, '$[1]', '蓝')
                  WHERE ID = ?;`,
          [interaction.user.id]
        );
        await pool.execute(
          `UPDATE PLAYER
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '🔄交换生')
      WHERE ID = ?;`,[interaction.user.id]
        );

        await item_disp(origin);
    } catch (error) {
        const embed = new EmbedBuilder()
          .setDescription("操作已超时或者这个人不存在敌方的队伍里面。。")
          .setColor("Yellow");
        await interaction.followUp({embeds: [embed],ephemeral: false})
        console.log(error);
    }
    
}

async function make_swap(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT SWAP, TEAM FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].SWAP[0] <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("交换生道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent],  });
    return;
  }

  await interaction.deferReply({  });
  const embed = new EmbedBuilder()
    .setDescription(
      "确定要使用🔄__交换生__\n本道具会使和让你指示一个敌队里面的人和你换队"
    )
    .setColor("Yellow");

  const Buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("确认")
      .setLabel("确认")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("取消")
      .setLabel("取消")
      .setStyle(ButtonStyle.Danger)
  );

  const reply = await interaction.editReply({
    embeds: [embed],
    components: [Buttons],
  });

  const filter = (i) => i.user.id === interaction.member.id;
  const collector = reply.createMessageComponentCollector({
    ComponentType: ComponentType.Button,
    filter,
  });

  collector.on("collect", (i) => {
    if (i.customId === "取消") {
      const cancel = new EmbedBuilder()
        .setDescription("行动已被取消")
        .setColor("Red");

      interaction.editReply({
        embeds: [cancel],
        components: [],
      });
    }
    if (i.customId === "确认") {
      const embed = new EmbedBuilder()
      .setDescription("在60秒内输入敌对的一名人员或者输入随机")
      .setColor("Yellow");
      interaction.editReply({embeds: [embed],
        components: [],
      });
      action(origin, interaction,i);
    }
  });
}

module.exports = make_swap;