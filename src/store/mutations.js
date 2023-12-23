export default {
  setDate(state, payload) {
    console.log("payload hello", payload);
    let { season, year } = { ...payload };
    console.log(season, "lasada");
    state.date = {
      season,
      year,
    };
    console.log("nueva state of date", state);
  },
};
