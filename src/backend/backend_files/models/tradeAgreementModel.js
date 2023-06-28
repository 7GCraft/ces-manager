module.exports = class TradeAgreement {
    /**
     * Constructor for trade agreement objects.
     * @param {Number} tradeAgreementId must be an integer.
     * @param {Array} traders must be an array of trader objects.
     * @param {String} desc must be a string.
     */
    constructor(tradeAgreementId, traders, desc) {
        this.tradeAgreementId = tradeAgreementId;
        this.traders = traders;
        this.desc = desc;
    }
};