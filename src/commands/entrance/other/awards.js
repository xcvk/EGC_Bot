const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");
const prizes = require("./prizes");
const { map } = require("async");

let translation = new Map();
translation.set("EGG", "🥚 臭鸡蛋");
translation.set("COIN100", "🪙 金币 100枚");
translation.set("COIN500", "🪙 金币 500枚");
translation.set("RETURN1", "📜 1%返利券");
translation.set("CUT1", "📜 1%陪玩分成一周");
translation.set("MESSAGE", "❤️ 温馨信息");

translation.set("ROSE", "🌹 玫瑰");
translation.set("COUPON5", "💸 5刀优惠券");
translation.set("BEER", "🍺 啤酒");
translation.set("COIN1000", "🪙 金币 1000枚");
translation.set("COIN5000", "🪙 金币 5000枚");
translation.set("CUT2", "📜 2%陪玩分成一周");
translation.set("RETURN2", "📜 2%返利券");

translation.set("CHRISTMAS2", "🎁 圣诞礼物第二个");
translation.set("CHRISTMAS1", "🎁 圣诞礼物第一个");
translation.set("COUPON10", "💸 10刀优惠券");
translation.set("Discord_Nitro", "🚀 Discord Nitro会员");
translation.set("CUT3", "📜 3%陪玩分成一周 最高积累8张");
translation.set("RETURN3", "📜 3%返利券");
translation.set("SOLO_ORDER", "🚶‍♀️ 独立下单区一月");

translation.set("NECTAR", "💮 琼华露");
translation.set("CAKE", "🍰 星座蛋糕");
translation.set("LHASA", "🍾 洛桑酒");
translation.set("COIN10000", "🪙 金币 10000枚");
translation.set("CUT4", "📜 4%陪玩分成一周");
translation.set("RETURN4", "📜 4%返利券");
translation.set("CHECK50", "💸 50代金券");

translation.set("TEQUILA", "🍹 龙舌兰");
translation.set("FLOWER_WINE", "🍷 百花酿");
translation.set("CUT5", "📜 5%陪玩分成一周");
translation.set("RETURN5", "📜 5%返利券");
translation.set("GEMS300", "💎 300宝石");
translation.set("CHECK100", "💸 100代金券");

async function give(
  white_chance,
  green_chance,
  blue_chance,
  orange_chance,
  red_chance,
  player,
  client
) {
  const channelID = "1184531581960994927";
  const channel = client.channels.cache.get(channelID);

  const user = await client.users.fetch(player);
  const avatarURL = user.displayAvatarURL({ format: "png", dynamic: true });
  const username = user.username;

  const [all] = await pool.execute("SELECT PRIZES FROM TEAMS WHERE LINE = 1");
  let white = new Map();
  let green = new Map();
  let blue = new Map();
  let orange = new Map();
  let red = new Map();

  const prizesData = all[0].PRIZES;

  // White Map
  if (prizesData.EGG) {
    white.set("EGG", prizesData.EGG);
  }
  white.set("COIN100", prizesData.COIN100);
  white.set("COIN500", prizesData.COIN500);
  white.set("RETURN1", prizesData.RETURN1);
  white.set("CUT1", prizesData.CUT1);
  white.set("MESSAGE", prizesData.MESSAGE);

  // Green Map
  if (prizesData.ROSE) {
    green.set("ROSE", prizesData.ROSE);
  }
  if (prizesData.COUPON5) {
    green.set("COUPON5", prizesData.COUPON5);
  }
  if (prizesData.BEER) {
    green.set("BEER", prizesData.BEER);
  }
  green.set("COIN1000", prizesData.COIN1000);
  green.set("COIN5000", prizesData.COIN5000);
  green.set("CUT2", prizesData.CUT2);
  green.set("RETURN2", prizesData.RETURN2);

  // Blue Map
  if (prizesData.CHRISTMAS2) {
    blue.set("CHRISTMAS2", prizesData.CHRISTMAS2);
  }
  if (prizesData.CHRISTMAS1) {
    blue.set("CHRISTMAS1", prizesData.CHRISTMAS1);
  }
  if (prizesData.COUPON10) {
    blue.set("COUPON10", prizesData.COUPON10);
  }
  if (prizesData.Discord_Nitro) {
    blue.set("Discord_Nitro", prizesData.Discord_Nitro);
  }
  blue.set("CUT3", prizesData.CUT3);
  blue.set("RETURN3", prizesData.RETURN3);
  if (prizesData.SOLO_ORDER) {
    blue.set("SOLO_ORDER", prizesData.SOLO_ORDER);
  }

  // Orange Map
  if (prizesData.NECTAR) {
    orange.set("NECTAR", prizesData.NECTAR);
  }
  if (prizesData.CAKE) {
    orange.set("CAKE", prizesData.CAKE);
  }
  if (prizesData.LHASA) {
    orange.set("LHASA", prizesData.LHASA);
  }
  orange.set("COIN10000", prizesData.COIN10000);
  orange.set("CUT4", prizesData.CUT4);
  orange.set("RETURN4", prizesData.RETURN4);
  if (prizesData.CHECK50) {
    orange.set("CHECK50", prizesData.CHECK50);
  }
  // Red Map
  if (prizesData.TEQUILA) {
    red.set("TEQUILA", prizesData.TEQUILA);
  }
  if (prizesData.FLOWER_WINE) {
    red.set("FLOWER_WINE", prizesData.FLOWER_WINE);
  }
  red.set("CUT5", prizesData.CUT5);
  red.set("RETURN5", prizesData.RETURN5);
  red.set("GEMS300", prizesData.GEMS300);
  if (prizesData.CHECK100) {
    red.set("CHECK100", prizesData.CHECK100);
  }
  const chance = Math.floor(Math.random() * (101 - 1) + 1);
  switch (true) {
    case chance <= white_chance:
      let white_item = Math.floor(Math.random() * white.size + 1);
      let white_iter = 1;
      for (const [key, value] of white) {
        if (white_iter === white_item) {
          white_item = key;
          break;
        }
        white_iter++;
      }

      if (white_item === "MESSAGE") {
        let message = Math.floor(Math.random() * 3 + 1);
        if (message === 1) {
          const embed_white = new EmbedBuilder()
            .setDescription(
              `愿你在圣诞节里收获幸福和快乐，祝福你度过一个温馨，美好的节日！\n <@${player}>`
            )
            .setColor("White")
            .setAuthor({ iconURL: avatarURL, name: username });
          await channel.send({ embeds: [embed_white] });
        } else if (message === 2) {
          const embed = new EmbedBuilder()
            .setDescription(
              `愿圣诞老人带给你满满的祝福与喜悦，祝你拥有一个美好而难忘的圣诞节！\n <@${player}>`
            )
            .setColor("White")
            .setAuthor({ iconURL: avatarURL, name: username });
          await channel.send({ embeds: [embed]  });
        } else {
          const embed = new EmbedBuilder()
            .setDescription(
              `福你度过一个充满温情和欢乐的圣诞节，新年更美好！\n <@${player}>`
            )
            .setColor("White")
            .setAuthor({ iconURL: avatarURL, name: username });
          await channel.send({ embeds: [embed] });
        }
      } else {
        if (white_item === "EGG") {
          await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.EGG', ${white.get("EGG") - 1})
            WHERE LINE = 1;`);
          if (white.get("EGG") === 1) {
            await pool.execute(
              `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.EGG');`
            );
          }
        }
        await pool.execute(
          `UPDATE PLAYER SET PRIZES = JSON_ARRAY_APPEND(IFNULL(PRIZES, '[]'), '$', '${translation.get(
            white_item
          )}') WHERE ID = ?;`,
          [player]
        );

        const embed_white = new EmbedBuilder()
          .setDescription(
            `恭喜<@${player}> 获得了${translation.get(white_item)}!!!!`
          )
          .setColor("White")
          .setAuthor({ iconURL: avatarURL, name: username });
        await channel.send({ embeds: [ embed_white ] });
      }
      break;

    case chance <= green_chance:
      let green_item = Math.floor(Math.random() * green.size + 1);
      let green_iter = 1;
      for (const [key, value] of green) {
        if (green_iter === green_item) {
          green_item = key;
          break;
        }
        green_iter++;
      }

      if (green_item === "ROSE") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.ROSE', ${green.get("ROSE") - 1})
            WHERE LINE = 1;`);
        if (green.get("ROSE") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.ROSE');`
          );
        }
      } else if (green_item === "COUPON5") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.COUPON5', ${
              green.get("COUPON5") - 1
            })
            WHERE LINE = 1;`);
        if (green.get("COUPON5") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.COUPON5');`
          );
        }
      } else if (green_item === "BEER") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.BEER', ${green.get("BEER") - 1})
            WHERE LINE = 1;`);
        if (green.get("BEER") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.BEER');`
          );
        }
      }
      await pool.execute(
        `UPDATE PLAYER SET PRIZES = JSON_ARRAY_APPEND(IFNULL(PRIZES, '[]'), '$', '${translation.get(
          green_item
        )}') WHERE ID = ?;`,
        [player]
      );

      const embed_green = new EmbedBuilder()
        .setDescription(
          `恭喜<@${player}> 获得了${translation.get(green_item)}!!!!`
        )
        .setColor("Green")
        .setAuthor({ iconURL: avatarURL, name: username });
      await channel.send({ embeds: [ embed_green ] });
      break;

    case chance <= blue_chance:
      // Handle blue case
      let blue_item = Math.floor(Math.random() * blue.size + 1);
      let blue_iter = 1;
      for (const [key, value] of blue) {
        if (blue_iter === blue_item) {
          blue_item = key;
          break;
        }
        blue_iter++;
      }

      if (blue_item === "CHRISTMAS2") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.CHRISTMAS2', ${
              blue.get("CHRISTMAS2") - 1
            })
            WHERE LINE = 1;`);
        if (blue.get("CHRISTMAS2") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.CHRISTMAS2');`
          );
        }
      } else if (blue_item === "CHRISTMAS1") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.CHRISTMAS1', ${
              blue.get("CHRISTMAS1") - 1
            })
            WHERE LINE = 1;`);
        if (blue.get("CHRISTMAS1") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.CHRISTMAS1');`
          );
        }
      } else if (blue_item === "COUPON10") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.COUPON10', ${
              blue.get("COUPON10") - 1
            })
            WHERE LINE = 1;`);
        if (blue.get("COUPON10") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.COUPON10');`
          );
        }
      } else if (blue_item === "SOLO_ORDER") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.SOLO_ORDER', ${
              blue.get("SOLO_ORDER") - 1
            })
            WHERE LINE = 1;`);
        if (blue.get("SOLO_ORDER") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.SOLO_ORDER');`
          );
        }
      } else if (blue_item === "Discord_Nitro") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.Discord_Nitro', ${
              blue.get("Discord_Nitro") - 1
            })
            WHERE LINE = 1;`);
        if (blue.get("Discord_Nitro") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.Discord_Nitro');`
          );
        }
      }

      await pool.execute(
        `UPDATE PLAYER SET PRIZES = JSON_ARRAY_APPEND(IFNULL(PRIZES, '[]'), '$', '${translation.get(
          blue_item
        )}') WHERE ID = ?;`,
        [player]
      );

      const embed_blue = new EmbedBuilder()
        .setDescription(
          `恭喜<@${player}> 获得了${translation.get(blue_item)}!!!!`
        )
        .setColor("Blue")
        .setAuthor({ iconURL: avatarURL, name: username });
      await channel.send({ embeds: [embed_blue] });
      break;

    case chance <= orange_chance:
      // Handle orange case
      let orange_item = Math.floor(Math.random() * orange.size + 1);
      let orange_iter = 1;
      for (const [key, value] of orange) {
        if (orange_iter === orange_item) {
          orange_item = key;
          break;
        }
        orange_iter++;
      }

      if (orange_item === "NECTAR") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.NECTAR', ${
              orange.get("NECTAR") - 1
            })
            WHERE LINE = 1;`);
        if (orange.get("NECTAR") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.NECTAR');`
          );
        }
      } else if (orange_item === "LHASA") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.LHASA', ${orange.get("LHASA") - 1})
            WHERE LINE = 1;`);
        if (orange.get("LHASA") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.LHASA');`
          );
        }
      } else if (orange_item === "CHECK50") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.CHECK50', ${
              orange.get("CHECK50") - 1
            })
            WHERE LINE = 1;`);
        if (orange.get("CHECK50") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.CHECK50');`
          );
        }
      } else if (orange_item === "CAKE") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.CAKE', ${orange.get("CAKE") - 1})
            WHERE LINE = 1;`);
        if (orange.get("CAKE") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.CAKE');`
          );
        }
      }
      await pool.execute(
        `UPDATE PLAYER SET PRIZES = JSON_ARRAY_APPEND(IFNULL(PRIZES, '[]'), '$', '${translation.get(
          orange_item
        )}') WHERE ID = ?;`,
        [player]
      );

      const embed_orange = new EmbedBuilder()
        .setDescription(
          `恭喜<@${player}> 获得了${translation.get(orange_item)}!!!!`
        )
        .setColor("Orange")
        .setAuthor({ iconURL: avatarURL, name: username });
      await channel.send({ embeds: [embed_orange] });
      break;

    case chance <= red_chance:
      // Handle red case
      let red_item = Math.floor(Math.random() * red.size + 1);
      let red_iter = 1;
      for (const [key, value] of red) {
        if (red_iter === red_item) {
          red_item = key;
          break;
        }
        red_iter++;
      }

      if (red_item === "TEQUILA") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.TEQUILA', ${
              red.get("TEQUILA") - 1
            })
            WHERE LINE = 1;`);
        if (red.get("TEQUILA") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.TEQUILA');`
          );
        }
      } else if (red_item === "FLOWER_WINE") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.FLOWER_WINE', ${
              red.get("FLOWER_WINE") - 1
            })
            WHERE LINE = 1;`);
        if (red.get("FLOWER_WINE") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.FLOWER_WINE');`
          );
        }
      } else if (red_item === "CHECK100") {
        await pool.execute(`UPDATE TEAMS
            SET PRIZES = JSON_SET(PRIZES, '$.CHECK100', ${
              red.get("CHECK100") - 1
            })
            WHERE LINE = 1;`);
        if (red.get("CHECK100") === 1) {
          await pool.execute(
            `UPDATE TEAMS SET PRIZES = JSON_REMOVE(PRIZES, '$.CHECK100');`
          );
        }
      }


      await pool.execute(
        `UPDATE PLAYER SET PRIZES = JSON_ARRAY_APPEND(IFNULL(PRIZES, '[]'), '$', '${translation.get(
          red_item
        )}') WHERE ID = ?;`,
        [player]
      );

      let everyone = "";
      if (red_item === "TEQUILA") {
        everyone = "@everyone";
      }
      const embed_red = new EmbedBuilder()
        .setDescription(
          `恭喜<@${player}> 获得了${translation.get(
            red_item
          )}!!!!\n ${everyone}`
        )
        .setColor("Red")
        .setAuthor({ iconURL: avatarURL, name: username });
      await channel.send({ embeds: [embed_red] });
      break;
  }
}

async function get(player, client) {
  const [data] = await pool.execute(`SELECT * FROM PLAYER WHERE ID = ?`, [player]);
  if (data[0].STEPS <= 300) {
    await give(60, 90, 100, 0, 0, player, client);
  } else if (data[0].STEPS <= 600) {
    await give(60, 90, 100, 0, 0, player, client);
    await give(45, 80, 95, 100, 0, player, client);
  } else if (data[0].STEPS <= 900) {
    await give(60, 90, 100, 0, 0, player, client);
    await give(45, 80, 95, 100, 0, player, client);
    await give(40, 70, 90, 99, 100, player, client);
  } else if (data[0].STEPS <= 1200) {
    await give(60, 90, 100, 0, 0, player, client);
    await give(45, 80, 95, 100, 0, player, client);
    await give(40, 70, 90, 99, 100, player, client);
    await give(35, 60, 80, 97, 100, player, client);
  } else {
    await give(60, 90, 100, 0, 0, player, client);
    await give(45, 80, 95, 100, 0, player, client);
    await give(40, 70, 90, 99, 100, player, client);
    await give(35, 60, 80, 97, 100, player, client);
    await give(25, 45, 70, 95, 100, player, client);
  }
}

async function award(teams, client) {
  if (teams === "红") {
    const [red_team] = await pool.execute(
      "SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1"
    );


    let red_map = new Map();
    for (let i = 0; i < red_team[0].RED_MEMBERS.length; ++i) {
      const [steps] = await pool.execute(`SELECT STEPS FROM PLAYER WHERE ID = ?`,[red_team[0].RED_MEMBERS[i]]);
      red_map.set(red_team[0].RED_MEMBERS[i],steps[0].STEPS);
    }
    let mapArray = Array.from(red_map);

    // Sort the array based on values in descending order
    mapArray.sort((a, b) => b[1] - a[1]);
    for (let i = 0; i < mapArray.length; ++i) {
      const player = mapArray[i][0];
      await get(player, client);
      
      await pool.execute(
        `UPDATE PLAYER SET STEPS = 0 WHERE ID = ?`,
        [mapArray[i][0]]
      );
      
    }
    await pool.execute(`UPDATE TEAMS SET RED_STEPS = 0 WHERE LINE = 1`);
    const [multiplier] = await pool.execute("SELECT MULTIPLIER_RED FROM TEAMS WHERE LINE = 1");
    await pool.execute(
      `UPDATE TEAMS SET MULTIPLIER_RED = ${
        multiplier[0].MULTIPLIER_RED + 1
      } WHERE LINE = 1`
    );
  } else {
    const [blue_team] = await pool.execute(
      "SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1"
    );

    let blue_map = new Map();
    for (let i = 0; i < blue_team[0].BLUE_MEMBERS.length; ++i) {
      const [steps] = await pool.execute(`SELECT STEPS FROM PLAYER WHERE ID = ?`,[blue_team[0].BLUE_MEMBERS[i]]);
      blue_map.set(blue_team[0].BLUE_MEMBERS[i],steps[0].STEPS);
    }
    let mapArray = Array.from(blue_map);

    // Sort the array based on values in descending order
    mapArray.sort((a, b) => b[1] - a[1]);

    for (let i = 0; i < mapArray.length; ++i) {
      const player = mapArray[i][0];
      await get(player, client);
      
      await pool.execute(
        `UPDATE PLAYER SET STEPS = 0 WHERE ID = ?`,
        [mapArray[i][0]]
      );
      
    }
    await pool.execute(`UPDATE TEAMS SET BLUE_STEPS = 0 WHERE LINE = 1`);
    const [multiplier] = await pool.execute("SELECT MULTIPLIER_BLUE FROM TEAMS WHERE LINE = 1");
    await pool.execute(
      `UPDATE TEAMS SET MULTIPLIER_BLUE = ${
        multiplier[0].MULTIPLIER_BLUE + 1
      } WHERE LINE = 1`
    );
  }
}

module.exports = award;
