// ====== SISTEMA DE REGISTRO ======
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const config = require('../config/config');
const database = require('../utils/database');
const permissions = require('../utils/permissions');

module.exports = {
    // Comando para iniciar registro manual
    async register(message) {
        if (!permissions.hasPermission(message.member, 'MANAGE_GUILD')) {
            return message.reply('❌ Você não tem permissão para usar este comando!');
        }

        await this.sendRegistrationMessage(message.channel);
        message.reply('✅ Mensagem de registro enviada!');
    },

    // Enviar mensagem de registro
    async sendRegistrationMessage(channel, user = null) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.INFO)
            .setTitle('📝 Sistema de Registro')
            .setDescription(
                user 
                    ? `Olá ${user}! Bem-vindo(a) ao servidor! 🎉\n\nPara ter acesso completo ao servidor, você precisa se registrar e verificar sua conta.`
                    : 'Para ter acesso completo ao servidor, você precisa se registrar e verificar sua conta.'
            )
            .addFields(
                { name: '📋 Como funciona:', value: '1️⃣ Clique em "Registrar"\n2️⃣ Leia as regras\n3️⃣ Clique em "Verificar"\n4️⃣ Receba seu cargo!', inline: false },
                { name: '✅ Benefícios:', value: '• Acesso a todos os canais\n• Participar de sorteios\n• Interagir com a comunidade', inline: false }
            )
            .setFooter({ text: 'Clique no botão abaixo para começar!' })
            .setTimestamp();

        const registerButton = new ButtonBuilder()
            .setCustomId('registration_start')
            .setLabel('📝 Registrar')
            .setStyle(ButtonStyle.Primary);

        const rulesButton = new ButtonBuilder()
            .setCustomId('registration_rules')
            .setLabel('📜 Ver Regras')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(registerButton, rulesButton);

        try {
            await channel.send({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Erro ao enviar mensagem de registro:', error);
        }
    },

    // Processo de registro
    async startRegistration(interaction) {
        const user = interaction.user;
        const member = interaction.member;

        // Verificar se já está registrado
        const userData = database.getUser(user.id);
        if (userData && userData.registered) {
            return interaction.reply({
                content: '✅ Você já está registrado! Se não tem o cargo, clique em "Verificar".',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.COLORS.SUCCESS)
            .setTitle('📝 Processo de Registro')
            .setDescription(`${user}, você está iniciando o processo de registro!`)
            .addFields(
                { name: '📋 Informações importantes:', value: '• Ao se registrar, você concorda em seguir as regras do servidor\n• Comportamento inadequado resultará em punições\n• Respeite todos os membros da comunidade', inline: false },
                { name: '🎯 Próximo passo:', value: 'Clique em "Confirmar Registro" para continuar', inline: false }
            )
            .setFooter({ text: 'Registro em andamento...' })
            .setTimestamp();

        const confirmButton = new ButtonBuilder()
            .setCustomId('registration_confirm')
            .setLabel('✅ Confirmar Registro')
            .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
            .setCustomId('registration_cancel')
            .setLabel('❌ Cancelar')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    },

    // Confirmar registro
    async confirmRegistration(interaction) {
        const user = interaction.user;

        try {
            // Salvar registro no banco de dados
            const userData = database.getUser(user.id) || {};
            userData.registered = true;
            userData.registrationDate = Date.now();
            userData.guildId = interaction.guild.id;
            database.saveUser(user.id, userData);

            const embed = new EmbedBuilder()
                .setColor(config.COLORS.SUCCESS)
                .setTitle('🎉 Registro Concluído!')
                .setDescription(`Parabéns ${user}! Seu registro foi concluído com sucesso!`)
                .addFields(
                    { name: '🔹 Status:', value: 'Registrado ✅', inline: true },
                    { name: '🔹 Data:', value: new Date().toLocaleDateString('pt-BR'), inline: true },
                    { name: '🔹 Próximo passo:', value: 'Clique em "Verificar" para receber seu cargo!', inline: false }
                )
                .setFooter({ text: 'Bem-vindo à comunidade!' })
                .setTimestamp();

            const verifyButton = new ButtonBuilder()
                .setCustomId('registration_verify')
                .setLabel('✅ Verificar')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(verifyButton);

            await interaction.update({
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            console.error('Erro ao confirmar registro:', error);
            await interaction.reply({
                content: '❌ Erro ao processar seu registro. Tente novamente!',
                ephemeral: true
            });
        }
    },

    // Verificar usuário e dar cargo
    async verifyUser(interaction) {
        const user = interaction.user;
        const member = interaction.member;

        try {
            // Verificar se está registrado
            const userData = database.getUser(user.id);
            if (!userData || !userData.registered) {
                return interaction.reply({
                    content: '❌ Você precisa se registrar primeiro!',
                    ephemeral: true
                });
            }

            // Verificar se já tem o cargo
            const verifiedRole = interaction.guild.roles.cache.find(role => 
                role.name === config.MODERATION.VERIFIED_ROLE
            );

            if (!verifiedRole) {
                return interaction.reply({
                    content: `❌ Cargo "${config.MODERATION.VERIFIED_ROLE}" não encontrado! Contate um administrador.`,
                    ephemeral: true
                });
            }

            if (member.roles.cache.has(verifiedRole.id)) {
                return interaction.reply({
                    content: '✅ Você já possui o cargo de verificado!',
                    ephemeral: true
                });
            }

            // Adicionar cargo
            await member.roles.add(verifiedRole);

            // Atualizar dados do usuário
            userData.verified = true;
            userData.verificationDate = Date.now();
            database.saveUser(user.id, userData);

            const embed = new EmbedBuilder()
                .setColor(config.COLORS.SUCCESS)
                .setTitle('🎊 Verificação Concluída!')
                .setDescription(`${user}, você foi verificado com sucesso!`)
                .addFields(
                    { name: '🔹 Cargo recebido:', value: verifiedRole.name, inline: true },
                    { name: '🔹 Status:', value: 'Verificado ✅', inline: true },
                    { name: '🔹 Acesso:', value: 'Agora você tem acesso completo ao servidor!', inline: false }
                )
                .setFooter({ text: 'Aproveite sua estadia na comunidade!' })
                .setTimestamp();

            await interaction.update({
                embeds: [embed],
                components: []
            });

        } catch (error) {
            console.error('Erro ao verificar usuário:', error);
            await interaction.reply({
                content: '❌ Erro ao processar sua verificação. Contate um administrador!',
                ephemeral: true
            });
        }
    },

    // Mostrar regras
    async showRules(interaction) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.INFO)
            .setTitle('📜 Regras do Servidor')
            .setDescription('Por favor, leia e respeite todas as regras:')
            .addFields(
                { name: '1️⃣ Respeito', value: 'Trate todos com respeito e cordialidade', inline: false },
                { name: '2️⃣ Sem Spam', value: 'Não faça spam ou flood nos canais', inline: false },
                { name: '3️⃣ Conteúdo Apropriado', value: 'Mantenha o conteúdo apropriado para todas as idades', inline: false },
                { name: '4️⃣ Sem Ofensas', value: 'Proibido xingamentos, ofensas ou discriminação', inline: false },
                { name: '5️⃣ Use os Canais Corretos', value: 'Utilize cada canal para seu propósito específico', inline: false },
                { name: '6️⃣ Siga os ToS', value: 'Respeite os Termos de Serviço do Discord', inline: false }
            )
            .setFooter({ text: 'O descumprimento das regras resultará em punições!' })
            .setTimestamp();

        const backButton = new ButtonBuilder()
            .setCustomId('registration_back')
            .setLabel('🔙 Voltar')
            .setStyle(ButtonStyle.Secondary);

        const registerButton = new ButtonBuilder()
            .setCustomId('registration_start')
            .setLabel('📝 Registrar')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(backButton, registerButton);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    },

    // Cancelar registro
    async cancelRegistration(interaction) {
        const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Registro Cancelado')
            .setDescription('Seu processo de registro foi cancelado.')
            .addFields(
                { name: '🔄 Tentar novamente:', value: 'Você pode iniciar o registro a qualquer momento clicando no botão correspondente.', inline: false }
            )
            .setFooter({ text: 'Esperamos você de volta!' })
            .setTimestamp();

        await interaction.update({
            embeds: [embed],
            components: []
        });
    }
};
