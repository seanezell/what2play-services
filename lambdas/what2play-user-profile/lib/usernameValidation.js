exports.isValidUsername = (username) => {
    const regex = /^[a-zA-Z0-9_-]{3,20}$/;
    return regex.test(username);
};

exports.containsProfanity = async (username) => {
    // Lazy load leo-profanity only when this function is called
    const leoProfanity = await require('leo-profanity');

    leoProfanity.loadDictionary();
    const customDeny = ['admin', 'api', 'root', 'system', 'null', 'undefined'];
    leoProfanity.add(customDeny);

    const n = normalizeUsername(username);
    if (!n) return false;
    // Check via leo-profanity (covers many obscene terms) and explicit substring checks
    const profane = leoProfanity.check(n);
    const containsReserved = customDeny.some(w => n.includes(w));
    return profane || containsReserved;
};

// Normalize username for more robust checking: lowercase, remove diacritics,
// simple leet substitutions, strip non-alphanumerics, collapse repeated chars.
const normalizeUsername = (name) => {
    const leetMap = { '0':'o','1':'i','3':'e','4':'a','5':'s','7':'t' };
        let s = String(name || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    s = s.split('').map(ch => leetMap[ch] || ch).join('');
    s = s.replace(/[^a-z0-9]/g, '');
    s = s.replace(/(.)\1{2,}/g, '$1$1');
    return s;
};