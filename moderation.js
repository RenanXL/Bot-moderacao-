// ====== COMANDOS DE MODERAÇÃO ======
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config/config');
const database = require('../utils/database');
const permissions = require('../utils/permissions');
const timeParser = require('../utils/timeParser');

module.exports = {
    // Comando de banir
    async ban(message, args) {
        if (!permissions.hasPermission(message.member, PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ Você não tem permissão para banir membros!');
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Mencione um usuário para banir! Uso: `!ban @usuário [motivo]`');
        }

        if (!target.bannable) {
            return message.reply('❌ Não posso banir este usuário!');
        }

        const reason = args.slice(1).join(' ') || 'Sem motivo especificado';

        try {
            await target.ban({ reason });
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.MODERATION)
                .setTitle('🔨 Usuário Banido')
                .addFields(
                    { name: 'Usuário', value: `${target.user.tag}`, inline: true },
                    { name: 'Moderador', value: `${message.author.tag}`, inline: true },
                    { name: 'Motivo', value: reason, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao banir usuário:', error);
            message.reply('❌ Erro ao banir o usuário!');
        }
    },

    // Comando de expulsar
    async kick(message, args) {
        if (!permissions.hasPermission(message.member, PermissionFlagsBits.KickMembers)) {
            return message.reply('❌ Você não tem permissão para expulsar membros!');
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Mencione um usuário para expulsar! Uso: `!kick @usuário [motivo]`');
        }

        if (!target.kickable) {
            return message.reply('❌ Não posso expulsar este usuário!');
        }

        const reason = args.slice(1).join(' ') || 'Sem motivo especificado';

        try {
            await target.kick(reason);
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.MODERATION)
                .setTitle('👢 Usuário Expulso')
                .addFields(
                    { name: 'Usuário', value: `${target.user.tag}`, inline: true },
                    { name: 'Moderador', value: `${message.author.tag}`, inline: true },
                    { name: 'Motivo', value: reason, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao expulsar usuário:', error);
            message.reply('❌ Erro ao expulsar o usuário!');
        }
    },

    // Comando de silenciar
    async mute(message, args) {
        if (!permissions.hasPermission(message.member, PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Você não tem permissão para silenciar membros!');
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Mencione um usuário para silenciar! Uso: `!mute @usuário [tempo] [motivo]`');
        }

        if (!target.moderatable) {
            return message.reply('❌ Não posso silenciar este usuário!');
        }

        const timeArg = args[1] || '10';
        const maxMs = 28 * 24 * 60 * 60 * 1000; // 28 dias
        const timeMs = timeParser.parseDuration(timeArg, { maxMs, defaultMs: 10 * 60 * 1000 });
        
        if (!timeMs) {
            return message.reply('❌ Formato de tempo inválido! Use: número (minutos), 5min, 1h, 2d\nMáximo: 28 dias');
        }
        
        const time = timeParser.msToMinutes(timeMs);
        const reason = args.slice(2).join(' ') || 'Sem motivo especificado';

        try {
            await target.timeout(timeMs, reason);
            
            const humanTime = timeParser.humanizeDuration(timeMs);
            const endTimestamp = Math.floor((Date.now() + timeMs) / 1000);
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.MODERATION)
                .setTitle('🔇 Usuário Silenciado')
                .addFields(
                    { name: 'Usuário', value: `${target.user.tag}`, inline: true },
                    { name: 'Moderador', value: `${message.author.tag}`, inline: true },
                    { name: 'Duração', value: humanTime, inline: true },
                    { name: 'Termina em', value: `<t:${endTimestamp}:R>`, inline: true },
                    { name: 'Motivo', value: reason, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao silenciar usuário:', error);
            message.reply('❌ Erro ao silenciar o usuário!');
        }
    },

    // Comando de dessilenciar
    async unmute(message, args) {
        if (!permissions.hasPermission(message.member, PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Você não tem permissão para dessilenciar membros!');
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Mencione um usuário para dessilenciar! Uso: `!unmute @usuário [motivo]`');
        }

        if (!target.isCommunicationDisabled()) {
            return message.reply('❌ Este usuário não está silenciado!');
        }

        const reason = args.slice(1).join(' ') || 'Sem motivo especificado';

        try {
            await target.timeout(null, reason);
            
            const embed = new EmbedBuilder()
                .setColor(config.COLORS.SUCCESS)
                .setTitle('🔊 Usuário Dessilenciado')
                .addFields(
                    { name: 'Usuário', value: `${target.user.tag}`, inline: true },
                    { name: 'Moderador', value: `${message.author.tag}`, inline: true },
                    { name: 'Motivo', value: reason, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao dessilenciar usuário:', error);
            message.reply('❌ Erro ao dessilenciar o usuário!');
        }
    },

    // Comando de avisar
    async warn(message, args) {
        if (!permissions.hasPermission(message.member, PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Você não tem permissão para avisar membros!');
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Mencione um usuário para avisar! Uso: `!warn @usuário [motivo]`');
        }

        const reason = args.slice(1).join(' ') || 'Sem motivo especificado';

        try {
            // Salvar aviso no banco de dados
            const userData = database.getUser(target.id) || { warns: [] };
            userData.warns.push({
                reason,
                moderator: message.author.id,
                timestamp: Date.now()
            });
            database.saveUser(target.id, userData);

            const embed = new EmbedBuilder()
                .setColor(config.COLORS.WARNING)
                .setTitle('⚠️ Usuário Avisado')
                .addFields(
                    { name: 'Usuário', value: `${target.user.tag}`, inline: true },
                    { name: 'Moderador', value: `${message.author.tag}`, inline: true },
                    { name: 'Avisos', value: `${userData.warns.length}/${config.MODERATION.MAX_WARNS}`, inline: true },
                    { name: 'Motivo', value: reason, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [embed] });

            // Auto-banir se atingir limite de avisos
            if (userData.warns.length >= config.MODERATION.MAX_WARNS) {
                setTimeout(async () => {
                    try {
                        await target.ban({ reason: 'Limite de avisos atingido' });
                        message.channel.send(`🔨 ${target.user.tag} foi banido automaticamente por atingir ${config.MODERATION.MAX_WARNS} avisos!`);
                    } catch (error) {
                        console.error('Erro no auto-ban:', error);
                    }
                }, 2000);
            }

        } catch (error) {
            console.error('Erro ao avisar usuário:', error);
            message.reply('❌ Erro ao avisar o usuário!');
        }
    },

    // Comando de limpar mensagens
    async clear(message, args) {
        if (!permissions.hasPermission(message.member, PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ Você não tem permissão para gerenciar mensagens!');
        }

        const amount = parseInt(args[0]);
        if (!amount || amount < 1 || amount > 100) {
            return message.reply('❌ Especifique um número entre 1 e 100! Uso: `!clear [quantidade]`');
        }

        try {
            const deleted = await message.channel.bulkDelete(amount + 1, true);
            
            const reply = await message.channel.send(`✅ ${deleted.size - 1} mensagens foram deletadas!`);
            setTimeout(() => reply.delete().catch(() => {}), 5000);

        } catch (error) {
            console.error('Erro ao limpar mensagens:', error);
            message.reply('❌ Erro ao limpar as mensagens!');
        }
    },

    // Comando para ver avisos
    async warnings(message, args) {
        const target = message.mentions.members.first() || message.member;
        const userData = database.getUser(target.id);

        if (!userData || !userData.warns || userData.warns.length === 0) {
            return message.reply(`${target.user.tag} não possui avisos!`);
        }

        const embed = new EmbedBuilder()
            .setColor(config.COLORS.WARNING)
            .setTitle(`⚠️ Avisos de ${target.user.tag}`)
            .setDescription(`Total: ${userData.warns.length} avisos`)
            .setTimestamp();

        userData.warns.forEach((warn, index) => {
            embed.addFields({
                name: `Aviso ${index + 1}`,
                value: `**Motivo:** ${warn.reason}\n**Data:** <t:${Math.floor(warn.timestamp / 1000)}:R>`,
                inline: false
            });
        });

        message.reply({ embeds: [embed] });
    },

    // Comando para remover avisos
    async unwarn(message, args) {
        if (!permissions.hasPermission(message.member, PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Você não tem permissão para remover avisos!');
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('❌ Mencione um usuário para remover aviso! Uso: `!unwarn @usuário [número_do_aviso | all]`');
        }

        const userData = database.getUser(target.id);
        if (!userData || !userData.warns || userData.warns.length === 0) {
            return message.reply(`${target.user.tag} não possui avisos para remover!`);
        }

        const warnIndex = args[1];
        
        try {
            if (warnIndex === 'all') {
                // Remover todos os avisos
                userData.warns = [];
                database.saveUser(target.id, userData);

                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.SUCCESS)
                    .setTitle('✅ Avisos Removidos')
                    .addFields(
                        { name: 'Usuário', value: `${target.user.tag}`, inline: true },
                        { name: 'Moderador', value: `${message.author.tag}`, inline: true },
                        { name: 'Ação', value: 'Todos os avisos foram removidos', inline: false }
                    )
                    .setTimestamp();

                message.reply({ embeds: [embed] });
                
            } else {
                // Remover aviso específico
                const index = parseInt(warnIndex) - 1;
                
                if (isNaN(index) || index < 0 || index >= userData.warns.length) {
                    return message.reply(`❌ Número de aviso inválido! Use um número de 1 a ${userData.warns.length} ou "all" para remover todos.`);
                }

                const removedWarn = userData.warns.splice(index, 1)[0];
                database.saveUser(target.id, userData);

                const embed = new EmbedBuilder()
                    .setColor(config.COLORS.SUCCESS)
                    .setTitle('✅ Aviso Removido')
                    .addFields(
                        { name: 'Usuário', value: `${target.user.tag}`, inline: true },
                        { name: 'Moderador', value: `${message.author.tag}`, inline: true },
                        { name: 'Avisos restantes', value: `${userData.warns.length}`, inline: true },
                        { name: 'Aviso removido', value: removedWarn.reason, inline: false }
                    )
                    .setTimestamp();

                message.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Erro ao remover aviso:', error);
            message.reply('❌ Erro ao remover o aviso!');
        }
    }
};
