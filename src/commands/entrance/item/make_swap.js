const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

const pool = require("../../../database/db-promise");
const item_disp = require("./item_disp");
const GPTContent = require("../../../openai/openai");



// SWAP ARRAY INDEX 1 IF VALUE IS 3 THEN TEAM IS BLUE AND IF VALUE IS 4 THEN TEAM IS RED
async function action(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT SWAP, TEAM FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].SWAP[0] <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("交换生道具不足")
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await origin.followUp({ embeds: [insufficent], });
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


    const date = new Date();
    await pool.execute(
      `UPDATE PLAYER
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '🔄交换生: 12月 ${date.getDate()}号 ${date.getHours()}时 ${date.getMinutes()}分')
      WHERE ID = ?;`, [interaction.user.id]
    );
    const message = collected.first().content;
    const [curr_team] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`, [interaction.user.id]);

    let search = null;

    await pool.execute(
      `UPDATE PLAYER
                  SET SWAP = JSON_SET(SWAP, '$[0]', ${results[0].SWAP[0] - 1}, '$[1]', '${results[0].SWAP[1]}')
                  WHERE ID = ?;`,
      [interaction.user.id]
    );

    const [buffz] = await pool.execute(`SELECT BUFFS FROM PLAYER WHERE ID = ?`, [
      interaction.user.id,
    ]);
    if (buffz[0].BUFFS.EFFECT_DOUBLE > 0) {
      await pool.execute(
        `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${Number(buffz[0].BUFFS.EFFECT_DOUBLE) - 1
        }) WHERE ID = ?;`,
        [interaction.user.id]
      );
      return;
    }

    const broken = message.substring(2, message.length - 1);
    if (curr_team[0].TEAM === "红") {
      const [team] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
      search = team[0].BLUE_MEMBERS;
    } else {
      const [team] = await pool.execute("SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1");
      search = team[0].RED_MEMBERS;
    }



    const myArray = [
      `<@${interaction.user.id}> 都是我的，都是我的！！哈哈哈哈哈哈`,
      `第二个半价都不行！<@${interaction.user.id}> 要的是买一赠一 那只能宠着ta喽~`,
      `优惠大酬宾，<@${interaction.user.id}> 下个道具可以用两次！`,
      `<@${interaction.user.id}> 爽翻了 双份的体验，双份的道具，哎~我有你们没有呢~`,
      `<@${interaction.user.id}> 恭喜你使用了双份体验道具！让敌人体验双倍的“快乐”吧！`,
      `<@${interaction.user.id}> 让对手的收获成为你的战利品！磁铁道具，现在发动！`,
      `<@${interaction.user.id}> 是时候扭转乾坤了！使用磁铁，让一切好东西都来到我们这边！`,
      `<@${interaction.user.id}> 看那对方的道具，马上就要变成我们的了！磁铁道具，展现你的魔力！`,
      `<@${interaction.user.id}> 抢夺战开始！磁铁道具，将对方的资源转为我们的资本！`,
      `<@${interaction.user.id}> 对方的道具即将改变归属。磁铁，现在就施展你的力量！`,
      `<@${interaction.user.id}> 穿越界限，体验不同的世界！使用交换生道具，看看敌人的生活是怎样的！`,
      `<@${interaction.user.id}> 今天，你将为另一个颜色而战！使用交换生，体验不同的团队精神！`,
      `<@${interaction.user.id}> 今天，让对手成为你的盟友。交换生，颠覆你的游戏体验！`,
      `<@${interaction.user.id}> 变换视角，可能会有不同的风景。交换生道具，让你暂时站在对方的立场！`,
      `<@${interaction.user.id}> 时机到了，让我们做个小小的叛徒！使用交换生，去体验对方的战术吧！`,
      `<@${interaction.user.id}> 忽然之间，你感到自己的队徽颜色改变了，原来是交换生的神奇力量！`,
      `<@${interaction.user.id}> 欢迎来到新家！但别忘了，这一切变化都来自神秘的交换生道具！`,
      `<@${interaction.user.id}> 混乱中，你意识到自己正站在新的队伍中，感谢交换生道具的小小恶作剧！`,
      `<@${interaction.user.id}> 在一瞬间，你的身份和忠诚发生了变化，现在你为新的队伍而战，这就是交换生的魔力！`,
      `<@${interaction.user.id}> 在交换生道具的一声令下，你现在属于一个全新的团队。是时候为新的目标而战了！`
    ];
    if (message === "随机") {
      if (curr_team[0].TEAM === "红") {
        let [enemy_team] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
        let [ally_team] = await pool.execute(
          "SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1"
        );
        const loser = enemy_team[0].BLUE_MEMBERS[Math.floor(Math.random() * enemy_team[0].BLUE_MEMBERS.length)];
        const [shield] = await pool.execute("SELECT BUFFS FROM PLAYER WHERE ID = ?", [loser]);
        if (shield[0].BUFFS.SPELL_SHIELD > 0) {

          await pool.execute(
            `UPDATE PLAYER
              SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${shield[0].BUFFS.SPELL_SHIELD - 1
            })
              WHERE ID = ?;`,
            [loser]
          );
          const deflect = new EmbedBuilder()
            .setDescription(`交换生道具已被<@${loser}>格挡！`)
            .setColor("Purple")
            .setAuthor({
              name: `${interaction.user.username}`,
              iconURL: `${interaction.user.avatarURL()}`,
            });
          await interaction.followUp({ embeds: [deflect] });
          return;
        }
        if (results[0].SWAP[1] === 0) {
          await pool.execute(
            `UPDATE PLAYER
                  SET SWAP = JSON_SET(SWAP, '$[0]', ${results[0].SWAP[0]}, '$[1]', '红')
                  WHERE ID = ?;`,
            [interaction.user.id]
          );
        }
        const [victim] = await pool.execute(`SELECT SWAP,TEAM FROM PLAYER WHERE ID = ?`, [loser]);
        if (victim[0].SWAP[1] === 0) {
          await pool.execute(
            `UPDATE PLAYER
                  SET SWAP = JSON_SET(SWAP, '$[0]', ${victim[0].SWAP[0]}, '$[1]', '${victim[0].TEAM}')
                  WHERE ID = ?;`,
            [loser]
          );
        }

        await pool.execute(`UPDATE PLAYER SET TEAM = '蓝' WHERE ID = ?`, [interaction.user.id]);
        await pool.execute(`UPDATE PLAYER SET TEAM = '红' WHERE ID = ?`, [
          loser,
        ]);
        const enemy_index = enemy_team[0].BLUE_MEMBERS.indexOf(loser);
        enemy_team[0].BLUE_MEMBERS.splice(enemy_index, 1);
        enemy_team[0].BLUE_MEMBERS.push(interaction.user.id);
        const ally_index = ally_team[0].RED_MEMBERS.indexOf(interaction.user.id);
        ally_team[0].RED_MEMBERS.splice(ally_index, 1);
        ally_team[0].RED_MEMBERS.push(loser);

        await pool.execute(
          `UPDATE TEAMS SET RED_MEMBERS = ? WHERE LINE = 1`, [ally_team[0].RED_MEMBERS]
        );
        await pool.execute(
          `UPDATE TEAMS SET BLUE_MEMBERS = ? WHERE LINE = 1`, [enemy_team[0].BLUE_MEMBERS]
        );

        const embed = new EmbedBuilder()
          .setDescription(myArray[Math.floor(Math.random() * (myArray.length))])
          .setAuthor({
            name: `${interaction.user.username}`,
            iconURL: `${interaction.user.avatarURL()}`,
          })
          .setColor("Green");
        await interaction.followUp({ embeds: [embed], ephemeral: false });
      } else {
        let [ally_team] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
        let [enemy_team] = await pool.execute(
          "SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1"
        );
        const loser =
          enemy_team[0].RED_MEMBERS[
          Math.floor(Math.random() * enemy_team[0].RED_MEMBERS.length)
          ];

        const [shield] = await pool.execute("SELECT BUFFS FROM PLAYER WHERE ID = ?", [loser]);
        if (shield[0].BUFFS.SPELL_SHIELD > 0) {

          await pool.execute(
            `UPDATE PLAYER
                SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${shield[0].BUFFS.SPELL_SHIELD - 1})
                WHERE ID = ?;`,
            [loser]
          );
          const deflect = new EmbedBuilder()
            .setDescription(`交换生道具已被<@${loser}>格挡！！，`)
            .setColor("Purple")
            .setAuthor({
              name: `${interaction.user.username}`,
              iconURL: `${interaction.user.avatarURL()}`,
            });
          await interaction.followUp({ embeds: [deflect] });
          return;
        }
        if (results[0].SWAP[1] === 0) {
          await pool.execute(
            `UPDATE PLAYER
                  SET SWAP = JSON_SET(SWAP, '$[0]', ${results[0].SWAP[0]}, '$[1]', '蓝')
                  WHERE ID = ?;`,
            [interaction.user.id]
          );
        }
        const [victim] = await pool.execute(`SELECT SWAP,TEAM FROM PLAYER WHERE ID = ?`, [loser]);
        if (victim[0].SWAP[1] === 0) {
          await pool.execute(
            `UPDATE PLAYER
                  SET SWAP = JSON_SET(SWAP, '$[0]', ${victim[0].SWAP[0]}, '$[1]', '${victim[0].TEAM}')
                  WHERE ID = ?;`,
            [loser]
          );
        }
        await pool.execute(`UPDATE PLAYER SET TEAM = '红' WHERE ID = ?`, [
          interaction.user.id,
        ]);
        await pool.execute(`UPDATE PLAYER SET TEAM = '蓝' WHERE ID = ?`, [
          loser,
        ]);
        const embed = new EmbedBuilder()
          .setDescription(myArray[Math.floor(Math.random() * (myArray.length))])
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
        await interaction.followUp({ embeds: [embed], ephemeral: false });
      }
      await item_disp(origin);
      return;
    } else if (search.includes(broken)) {


      const [shield] = await pool.execute("SELECT BUFFS FROM PLAYER WHERE ID = ?", [broken]);
      if (shield[0].BUFFS.SPELL_SHIELD > 0) {

        await pool.execute(
          `UPDATE PLAYER
          SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${shield[0].BUFFS.SPELL_SHIELD - 1
          })
          WHERE ID = ?;`,
          [broken]
        );
        const deflect = new EmbedBuilder()
          .setDescription(`交换生已被<@${broken}>格挡！！`)
          .setColor("Purple")
          .setAuthor({
            name: `${interaction.user.username}`,
            iconURL: `${interaction.user.avatarURL()}`,
          });
        await interaction.followUp({ embeds: [deflect] });
        return;
      }


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
      const [victim] = await pool.execute(`SELECT SWAP,TEAM FROM PLAYER WHERE ID = ?`, [broken]);
      if (victim[0].SWAP[1] === 0) {
        await pool.execute(
          `UPDATE PLAYER
                  SET SWAP = JSON_SET(SWAP, '$[0]', ${victim[0].SWAP[0]}, '$[1]', '${victim[0].TEAM}')
                  WHERE ID = ?;`,
          [broken]
        );
      }


      await pool.execute(`UPDATE PLAYER SET TEAM = '${my_team}' WHERE ID = ?`, [
        interaction.user.id,
      ]);
      await pool.execute(`UPDATE PLAYER SET TEAM = '${their_team}' WHERE ID = ?`, [
        broken,
      ]);

      const embed = new EmbedBuilder()
        .setDescription(myArray[Math.floor(Math.random() * (myArray.length))])
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`,
        })
        .setColor("Green");
      await interaction.followUp({ embeds: [embed], ephemeral: false });

      await item_disp(origin);
      return;
    } else {
      await item_disp(origin);
      throw new Error("Didnt work");
    }
  } catch (error) {
    console.log(error);
    const embed = new EmbedBuilder()
      .setDescription("操作已超时或者这个人不存在敌方的队伍里面。。")
      .setColor("Yellow")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await interaction.followUp({ embeds: [embed], ephemeral: false })
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
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await interaction.reply({ embeds: [insufficent], });
    return;
  }

  await interaction.deferReply({});
  const embed = new EmbedBuilder()
    .setDescription(
      "确定要使用🔄__交换生__\n本道具会使和让你指示一个敌队里面的人和你换队或者打出随机"
    )
    .setColor("Yellow")
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.avatarURL()}`
    });

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
        .setColor("Red")
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`
        });

      interaction.editReply({
        embeds: [cancel],
        components: [],
      });
    }
    if (i.customId === "确认") {
      const embed = new EmbedBuilder()
        .setDescription("在60秒内输入敌对的一名人员或者输入随机")
        .setColor("Yellow")
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`
        });
      interaction.editReply({
        embeds: [embed],
        components: [],
      });
      action(origin, interaction, i);
    }
  });
}

module.exports = make_swap;