// ====== UTILITÁRIO PARA PARSING DE TEMPO ======

module.exports = {
    // Converte string de tempo para milissegundos
    parseDuration(timeStr, options = {}) {
        if (!timeStr) return null;

        const { maxMs = Infinity, defaultMs = null } = options;
        
        // Se for só um número, assume minutos
        if (/^\d+$/.test(timeStr)) {
            const minutes = parseInt(timeStr);
            if (minutes <= 0) return null;
            const ms = minutes * 60 * 1000;
            return ms <= maxMs ? ms : null;
        }

        // Regex para parsing com sufixos
        const timeRegex = /^(\d+)([smhd]|min)$/i;
        const match = timeStr.match(timeRegex);

        if (!match) return defaultMs;

        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        if (value <= 0) return null;

        const multipliers = {
            s: 1000,                    // segundos
            m: 60 * 1000,              // minutos
            min: 60 * 1000,            // minutos
            h: 60 * 60 * 1000,         // horas
            d: 24 * 60 * 60 * 1000     // dias
        };

        const ms = value * (multipliers[unit] || multipliers.min);
        return ms <= maxMs ? ms : null;
    },

    // Converte milissegundos para string legível
    humanizeDuration(ms) {
        if (!ms || ms < 1000) return '0 segundos';

        const units = [
            { name: 'dia', plural: 'dias', ms: 24 * 60 * 60 * 1000 },
            { name: 'hora', plural: 'horas', ms: 60 * 60 * 1000 },
            { name: 'minuto', plural: 'minutos', ms: 60 * 1000 },
            { name: 'segundo', plural: 'segundos', ms: 1000 }
        ];

        const parts = [];
        let remaining = ms;

        for (const unit of units) {
            const count = Math.floor(remaining / unit.ms);
            if (count > 0) {
                parts.push(`${count} ${count === 1 ? unit.name : unit.plural}`);
                remaining -= count * unit.ms;
                if (parts.length === 2) break; // Máximo 2 unidades
            }
        }

        return parts.join(' e ') || '0 segundos';
    },

    // Converte milissegundos para minutos
    msToMinutes(ms) {
        return Math.floor(ms / (60 * 1000));
    },

    // Converte minutos para milissegundos
    minutesToMs(minutes) {
        return minutes * 60 * 1000;
    }
};