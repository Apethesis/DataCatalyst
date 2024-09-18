const { SlashCommandBuilder } = require('discord.js');

function execute(interaction, data) {
    if (!interaction.options.getUser('user') || !interaction.options.getInteger('access')) return interaction.reply({ "content": "Incomplete command.", "ephemeral": true })
    data.userInfo.findAll({ where: { id: interaction.user.id } }).then((user) =>  {
        if (user) {
            if (user.access >= 3 && interaction.options.getInteger('access') < user.access) {
                data.userInfo.findAll({ where: { id: interaction.options.getUser('user').id } }).then((usr) => {
                    if (user) {
                        if (usr.access >= interaction.options.getInteger('access')){
                            interaction.reply({ "content": `This users access level is above or equal to the one inputted.`, "ephemeral": true })
                        } else {
                            usr.update({ access: interaction.options.getInteger('access') })
                        }
                    } else {
                        data.userInfo.create({ id: interaction.options.getUser('user').id, access: interaction.options.getInteger('access') });
                    }
                    interaction.reply({ "content": `Promoted user to access level ${interaction.options.getInteger('access')}!`, "ephemeral": true } )
                })
            } else {
                interaction.reply({ "content": `This users access level is above or equal to the one inputted.`, "ephemeral": true })
            }
        } else {
            data.userInfo.create({ id: interaction.user.id });
            interaction.reply({ "content": `Your access level is not high enough for this operation.`, "ephemeral": true })
        }
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Promotes a user to a certain access level.')
        .addUserOption(option => {
            option.setName('user')
                .setDescription('The user to promote.')
        })
        .addIntegerOption(option => {
            option.setName('access')
                .setDescription('To what access level.')
            option.max_value = 5
            option.min_value = 0
        }),
    execute: execute
}