// ====== SISTEMA DE PERMISSÕES ======
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    // Verificar se membro tem permissão específica
    hasPermission(member, permission) {
        if (!member || !member.permissions) return false;

        // Admins sempre têm permissão
        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            return true;
        }

        // Verificar permissão específica
        if (typeof permission === 'string') {
            // Permissões customizadas
            switch (permission) {
                case 'MANAGE_GUILD':
                    return member.permissions.has(PermissionFlagsBits.ManageGuild);
                case 'MANAGE_CHANNELS':
                    return member.permissions.has(PermissionFlagsBits.ManageChannels);
                case 'MANAGE_ROLES':
                    return member.permissions.has(PermissionFlagsBits.ManageRoles);
                default:
                    return false;
            }
        }

        // Verificar permissão do Discord.js
        return member.permissions.has(permission);
    },

    // Verificar se bot tem permissão no canal
    botHasPermission(channel, permission) {
        if (!channel || !channel.guild) return false;

        const botMember = channel.guild.members.cache.get(channel.client.user.id);
        if (!botMember) return false;

        return channel.permissionsFor(botMember).has(permission);
    },

    // Verificar hierarquia de cargos
    canManageMember(moderator, target) {
        if (!moderator || !target) return false;

        // Não pode moderar a si mesmo
        if (moderator.id === target.id) return false;

        // Admins podem moderar qualquer um (exceto outros admins)
        if (moderator.permissions.has(PermissionFlagsBits.Administrator)) {
            return !target.permissions.has(PermissionFlagsBits.Administrator);
        }

        // Verificar hierarquia de cargos
        const moderatorHighestRole = moderator.roles.highest;
        const targetHighestRole = target.roles.highest;

        return moderatorHighestRole.position > targetHighestRole.position;
    },

    // Verificar se pode dar ban/kick
    canModerate(moderator, target, action) {
        if (!this.canManageMember(moderator, target)) return false;

        switch (action) {
            case 'ban':
                return this.hasPermission(moderator, PermissionFlagsBits.BanMembers) && target.bannable;
            case 'kick':
                return this.hasPermission(moderator, PermissionFlagsBits.KickMembers) && target.kickable;
            case 'timeout':
                return this.hasPermission(moderator, PermissionFlagsBits.ModerateMembers) && target.moderatable;
            case 'warn':
                return this.hasPermission(moderator, PermissionFlagsBits.ModerateMembers);
            default:
                return false;
        }
    },

    // Listar permissões de um membro
    getMemberPermissions(member) {
        if (!member || !member.permissions) return [];

        const permissions = [];
        const allPermissions = [
            { flag: PermissionFlagsBits.Administrator, name: 'Administrador' },
            { flag: PermissionFlagsBits.ManageGuild, name: 'Gerenciar Servidor' },
            { flag: PermissionFlagsBits.ManageChannels, name: 'Gerenciar Canais' },
            { flag: PermissionFlagsBits.ManageRoles, name: 'Gerenciar Cargos' },
            { flag: PermissionFlagsBits.BanMembers, name: 'Banir Membros' },
            { flag: PermissionFlagsBits.KickMembers, name: 'Expulsar Membros' },
            { flag: PermissionFlagsBits.ModerateMembers, name: 'Moderar Membros' },
            { flag: PermissionFlagsBits.ManageMessages, name: 'Gerenciar Mensagens' },
            { flag: PermissionFlagsBits.ManageNicknames, name: 'Gerenciar Apelidos' },
            { flag: PermissionFlagsBits.ViewAuditLog, name: 'Ver Logs de Auditoria' }
        ];

        allPermissions.forEach(perm => {
            if (member.permissions.has(perm.flag)) {
                permissions.push(perm.name);
            }
        });

        return permissions;
    },

    // Verificar permissões necessárias para comandos
    getRequiredPermissions(command) {
        const permissionMap = {
            'ban': [PermissionFlagsBits.BanMembers],
            'kick': [PermissionFlagsBits.KickMembers],
            'mute': [PermissionFlagsBits.ModerateMembers],
            'timeout': [PermissionFlagsBits.ModerateMembers],
            'warn': [PermissionFlagsBits.ModerateMembers],
            'clear': [PermissionFlagsBits.ManageMessages],
            'giveaway': [PermissionFlagsBits.ManageGuild],
            'register': [PermissionFlagsBits.ManageGuild]
        };

        return permissionMap[command] || [];
    },

    // Verificar se bot tem todas as permissões necessárias
    validateBotPermissions(guild) {
        const botMember = guild.members.cache.get(guild.client.user.id);
        if (!botMember) return { valid: false, missing: ['Bot não encontrado no servidor'] };

        const requiredPermissions = [
            { flag: PermissionFlagsBits.SendMessages, name: 'Enviar Mensagens' },
            { flag: PermissionFlagsBits.ViewChannel, name: 'Ver Canais' },
            { flag: PermissionFlagsBits.ReadMessageHistory, name: 'Ler Histórico' },
            { flag: PermissionFlagsBits.EmbedLinks, name: 'Inserir Links' },
            { flag: PermissionFlagsBits.UseExternalEmojis, name: 'Usar Emojis Externos' },
            { flag: PermissionFlagsBits.AddReactions, name: 'Adicionar Reações' },
            { flag: PermissionFlagsBits.ManageRoles, name: 'Gerenciar Cargos' },
            { flag: PermissionFlagsBits.BanMembers, name: 'Banir Membros' },
            { flag: PermissionFlagsBits.KickMembers, name: 'Expulsar Membros' },
            { flag: PermissionFlagsBits.ModerateMembers, name: 'Moderar Membros' },
            { flag: PermissionFlagsBits.ManageMessages, name: 'Gerenciar Mensagens' }
        ];

        const missing = [];
        const hasPermissions = [];

        requiredPermissions.forEach(perm => {
            if (botMember.permissions.has(perm.flag)) {
                hasPermissions.push(perm.name);
            } else {
                missing.push(perm.name);
            }
        });

        return {
            valid: missing.length === 0,
            missing,
            hasPermissions
        };
    }
};
