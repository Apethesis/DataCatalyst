const { SlashCommandBuilder } = require('discord.js');

function execute(interaction, data) {
    let uid
    if (interaction.options.getUser('user')) {
        uid = interaction.options.getUser('user').id
    } else {
        uid = interaction.user.id
    }
    data.userInfo.findAll({ where: { id: uid } }).then((user) =>  {
        if (user) {
            interaction.reply({ "content": `Users access level is ${user.access}`, "ephemeral": true })
        } else {
            interaction.reply({ "content": `Users access level is 0`, "ephemeral": true })
            data.userInfo.create({ id: uid, access: 0 });
        }
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getaccess')
        .setDescription('Gets a persons or your access level.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to get the access level of.')),
    execute: execute
}