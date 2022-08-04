module.exports = class Season {
    /**
     * Constructor for season objects.
     * @param {Number} year must be an integer.
     * @param {String} season must be a string.
     */
    constructor(season, year) {
        this.season = season;
        this.year = year;
    }
}