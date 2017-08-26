export const setLocale = async({commit, state}, {locale}) => {
    if (!state.i18n.messages.hasOwnProperty(locale)) {
        const module = await import(`../../translations/${locale}`);
        const messages = module.default;
        commit("addLocale", {locale, messages});
    }
    commit("setLocale", {locale});
};
