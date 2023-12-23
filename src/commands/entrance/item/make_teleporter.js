const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

const pool = require("../../../database/db-promise");
const item_disp = require("./item_disp");



async function action(origin, interaction) {
  let [results] = await pool.execute(`SELECT TELEPORTER,TEAM FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);

  let flag = null;
  let enemy_flag = null;
  if (results[0].TEAM === "蓝") {
    flag = "🟦";
    enemy_flag = "🟥";
  } else {
    flag = "🟥";
    enemy_flag = "🟦";
  }
  if (results[0].TELEPORTER <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("传送门道具不足")
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await interaction.reply({ embeds: [insufficent], });
    return;
  }

  await pool.execute(`UPDATE PLAYER SET TELEPORTER = TELEPORTER - 1 WHERE id = ?`, [
    interaction.user.id,
  ]);
  const date = new Date();


  await pool.execute(
    `UPDATE PLAYER
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '🌀传送门: 12月 ${date.getDate()}号 ${date.getHours()}时 ${date.getMinutes()}分')
      WHERE ID = ?;`,
    [interaction.user.id]
  );
  const filter = (msg) => !msg.author.bot;
  try {

    const collected = await interaction.channel.awaitMessages({
      filter,
      max: Infinity,
      time: 60000,
    });



    let spell_shield = new Set();
    let agree = new Set();

    test = []

    collected.forEach((msg) => {
      test.push(msg)
    })

    for (const msg of test) {

      if (msg.content === "无懈可击" && !spell_shield.has(msg.author.id)) {
        const [requirement] = await pool.execute(`SELECT TEAM, SPELL_SHIELD FROM PLAYER WHERE ID = ?`, [msg.author.id]);
        if (requirement[0].TEAM !== results[0].TEAM && requirement[0].SPELL_SHIELD > 0) {
          spell_shield.add(msg.author.id);
          if (spell_shield.size === 3) {
            const embed = new EmbedBuilder()
              .setDescription(`传送门已被敌方${enemy_flag}格挡！！`)
              .setColor("Purple")
              .setAuthor({
                name: `${interaction.user.username}`,
                iconURL: `${interaction.user.avatarURL()}`
              });
            await interaction.editReply({ embeds: [embed] });
            spell_shield.forEach(async (id) => {
              await pool.execute(`UPDATE PLAYER SET SPELL_SHIELD = SPELL_SHIELD - 1 WHERE ID = ?`, [id]);
            })
            return;
          }
        }
      } else if (msg.content === "同意" && !agree.has(msg.author.id)) {
        const [requirement] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`, [msg.author.id]);
        if (requirement[0].TEAM === results[0].TEAM) {
          agree.add(msg.author.id);
          if (agree.size === 10) {
            spell_shield.forEach(async (id) => {
              await pool.execute(`UPDATE PLAYER SET SPELL_SHIELD = SPELL_SHIELD - 1 WHERE ID = ?`, [id]);
            })

            const myArray = [
              `<@${interaction.user.id}> 打开时空之门，交换命运！使用传送门道具，让步数交换开始！`,
              `<@${interaction.user.id}> 现在，让我们跳跃到领先的位置！使用传送门，交换步数！`,
              `<@${interaction.user.id}> 命运之门已开启，让对手的优势成为你的！传送门道具，现在行动！`,
              `<@${interaction.user.id}> 现在，领先只是一道门的距离！使用传送门，让我们交换位置！`,
              `<@${interaction.user.id}> 一次跨越，换你领先。使用传送门，享受瞬间的颠覆！`
            ];
            const start = new EmbedBuilder()
              .setDescription(myArray[Math.floor(Math.random() * (myArray.length))])
              .setAuthor({
                name: `${interaction.user.username}${flag}`,
                iconURL: `${interaction.user.avatarURL()}`,
              })
              .setColor("Blurple");
            await interaction.followUp({embeds:{start}});

            let time = 3;
            const embed = new EmbedBuilder()
              .setDescription(`传送门已开启！！在${time}秒后交换步数`)
              .setColor("DarkGreen")
              .setAuthor({
                name: `${interaction.user.username}${flag}`,
                iconURL: `${interaction.user.avatarURL()}`,
              });

            await interaction.editReply({ embeds: [embed] });
            await new Promise(resolve => setTimeout(resolve, 1000));
            time -= 1;
            const countdown2 = new EmbedBuilder()
              .setAuthor({
                name: `${interaction.user.username}${flag}`,
                iconURL: `${interaction.user.avatarURL()}`,
              })
              .setDescription(`传送门已开启！！在${time}秒后交换步数`)
              .setColor("Yellow");
            await interaction.editReply({ embeds: [countdown2] });
            await new Promise(resolve => setTimeout(resolve, 1000));

            time -= 1;
            const countdown1 = new EmbedBuilder()
              .setAuthor({
                name: `${interaction.user.username}${flag}`,
                iconURL: `${interaction.user.avatarURL()}`,
              })
              .setDescription(`传送门已开启！！在${time}秒后交换步数`)
              .setColor("Purple");
            await interaction.editReply({ embeds: [countdown1] });
            await new Promise(resolve => setTimeout(resolve, 1000));

            const [steps] = await pool.execute("SELECT BLUE_STEPS, MULTIPLIER_BLUE FROM TEAMS WHERE LINE = 1");
            const temp = steps[0].BLUE_STEPS;
            const multi = steps[0].MULTIPLIER_BLUE;
            await pool.execute(`UPDATE TEAMS SET BLUE_STEPS = RED_STEPS WHERE LINE = 1`);
            await pool.execute(`UPDATE TEAMS SET MULTIPLIER_BLUE = MULTIPLIER_RED WHERE LINE = 1`);

            await pool.execute(`UPDATE TEAMS SET RED_STEPS = ${temp} WHERE LINE = 1`);
            await pool.execute(`UPDATE TEAMS SET MULTIPLIER_RED = ${multi} WHERE LINE = 1`);

            const array2 = [
              `忽然间，<@${interaction.user.id}>开启了传送门，两队的步数与对手交换了！`,
              `一道光闪过，<@${interaction.user.id}>的传送门道具已经改变了两队的位置！`,
              `突然，一切都变了，<@${interaction.user.id}>的传送门道具让两队的步数对调了位置！`,
              `在<@${interaction.user.id}>的奇妙一招下，传送门道具把两队的位置互换了！`,
              `转瞬即逆，<@${interaction.user.id}>激活了传送门道具，现在你才是领先的那队！`
              
            ];
            const finished = new EmbedBuilder()
              .setAuthor({
                name: `${interaction.user.username}${flag}`,
                iconURL: `${interaction.user.avatarURL()}`,
              })
              .setDescription(array2[Math.floor(Math.random() * (array2.length))])
              .setColor("Green");

            await interaction.editReply({ embeds: [finished] });
            return;
          }
        }
      }
      signal = 1;
    }

    if (spell_shield.size !== 3 && agree.size !== 10) {
      throw new Error("Failed task");
    }
  } catch (error) {
    console.log(error)
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.user.username}${flag}`,
        iconURL: `${interaction.user.avatarURL()}`,
      })
      .setDescription("一分钟友方里没有10个独特的人打出同意。。传送门被浪费了\n下次请预备好人数吧！")
      .setColor("Red");
    await origin.followUp({ embeds: [embed] });
  }

  await item_disp(origin);
}







async function make_teleporter(origin, interaction) {
  let [results] = await pool.execute(`SELECT TELEPORTER, TEAM FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);

  if (results[0].TELEPORTER <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("传送门道具不足")
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
      "确定要使用🌀__传送门__???\n这道具会使敌队和友方队伍交换步数！"
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
      let flag = null;
      if (results[0].TEAM === "蓝") {
        flag = "🟦";
      } else {
        flag = "🟥";
      }
      const embed = new EmbedBuilder()
        .setDescription(
          "请在一分钟里面叫本队伍10个独特的人打出同意\n@everyone\n敌方请在一分钟内叫3个独特的人打出无懈可击(这个人的道具里一定有无懈可击才能行，这会免疫对面的传送门！)"
        )
        .setColor("Yellow")
        .setAuthor({
          name: `${interaction.user.username}${flag}`,
          iconURL: `${interaction.user.avatarURL()}`,
        });
      interaction.editReply({ components: [] });
      i.reply({ embeds: [embed], components: [], ephemeral: false });
      action(origin, i);
    }
  });
}

module.exports = make_teleporter;