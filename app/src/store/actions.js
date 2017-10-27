export async function setLocale({ commit, dispatch }, { locale }) {
  await dispatch("addLocale", { locale });
  commit("setLocale", { locale });
}

export async function addLocale({ commit, state }, { locale }) {
  if (!state.i18n.messages.hasOwnProperty(locale)) {
    const module = await import(`../../translations/${locale}`);
    const messages = module.default;
    commit("addLocale", { locale, messages });
  }
}
