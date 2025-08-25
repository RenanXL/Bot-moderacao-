// ====== EVENTO: INTERAÇÕES (BOTÕES) ======
const registration = require('../commands/registration');
const database = require('../utils/database');
const config = require('../config/config');
const help = require('../commands/help');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        const { customId, user, member } = interaction;

        try {
            // ====== INTERAÇÕES DE REGISTRO ======
            if (customId === 'registration_start') {
                await registration.startRegistration(interaction);
                return;
            }

            if (customId === 'registration_confirm') {
                await registration.confirmRegistration(interaction);
                return;
            }

            if (customId === 'registration_verify') {
                await registration.verifyUser(interaction);
                return;
            }

            if (customId === 'registration_rules') {
                await registration.showRules(interaction);
                return;
            }

            if (customId === 'registration_cancel') {
                await registration.cancelRegistration(interaction);
                return;
            }

            if (customId === 'registration_back') {
                await registration.sendRegistrationMessage(interaction.channel);
                await interaction.update({ content: '🔙 Voltando ao menu principal...', embeds: [], components: [] });
                return;
            }

            // ====== INTERAÇÕES DE SORTEIO ======
            if (customId === 'giveaway_enter') {
                await this.handleGiveawayEntry(interaction);
                return;
            }

            // ====== INTERAÇÕES DE AJUDA ======
            if (customId.startsWith('help_')) {
                await this.handleHelpButtons(interaction, customId);
                return;
            }

        } catch (error) {
            console.error('❌ Erro ao processar interação:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocorreu um erro ao processar sua solicitação!',
                    ephemeral: true
                });
            }
        }
    },

    // Lidar com entrada em sorteios
    async handleGiveawayEntry(interaction) {
        const messageId = interaction.message.id;
        const userId = interaction.user.id;

        const giveawayData = database.getGiveaway(messageId);
        if (!giveawayData) {
            return interaction.reply({
                content: '❌ Sorteio não encontrado!',
                ephemeral: true
            });
        }

        if (giveawayData.ended) {
            return interaction.reply({
                content: '❌ Este sorteio já terminou!',
                ephemeral: true
            });
        }

        // Verificar se usuário já está participando
        if (giveawayData.participants.includes(userId)) {
            return interaction.reply({
                content: '⚠️ Você já está participando deste sorteio!',
                ephemeral: true
            });
        }

        // Verificar se usuário está registrado
        const userData = database.getUser(userId);
        if (!userData || !userData.registered) {
            return interaction.reply({
                content: '❌ Você precisa estar registrado para participar de sorteios! Use o comando `!register`.',
                ephemeral: true
            });
        }

        // Adicionar usuário ao sorteio
        giveawayData.participants.push(userId);
        database.saveGiveaway(messageId, giveawayData);

        await interaction.reply({
            content: `✅ Você entrou no sorteio! **${giveawayData.participants.length}** pessoas participando.`,
            ephemeral: true
        });
    },

    // Lidar com botões de ajuda
    async handleHelpButtons(interaction, customId) {
        let embed;

        switch (customId) {
            case 'help_moderation':
                embed = help.getModerationHelp();
                break;
            case 'help_giveaway':
                embed = help.getGiveawayHelp();
                break;
            case 'help_registration':
                embed = help.getRegistrationHelp();
                break;
            case 'help_setup':
                embed = help.getSetupHelp();
                break;
            case 'help_support':
                embed = help.getSupportHelp();
                break;
            default:
                return interaction.reply({
                    content: '❌ Comando de ajuda não reconhecido!',
                    ephemeral: true
                });
        }

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
