const { SlashCommandBuilder, PermissionFlagsBits,EmbedBuilder } = require("discord.js");
const pool = require("../../database/db-promise");




module.exports = {
    data: new SlashCommandBuilder()
        .setName("管理历史")
        .setDescription("加减玩家的数据")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),


    
    async execute(interaction) {


        const [test] = await pool.execute(
            `SELECT ADMIN_HISTORY FROM TEAMS WHERE LINE = 1`,
            [interaction.user.id]
        );

        let res = "";
        const history = test[0].ADMIN_HISTORY;
        if (history) {
            for (let i = 0; i < history.length; ++i) {
                res += `${history[i]}\n`;
            }
        }
        const embed = new EmbedBuilder()
            .setDescription(`**管理历史**\n${res}`)
            .setColor("Purple")
            .setAuthor({
                name: `${interaction.user.username}`,
                iconURL: `${interaction.user.avatarURL()}`,
            });

        await interaction.reply({ embeds: [embed], });
        return;
    }
}