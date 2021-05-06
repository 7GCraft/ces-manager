module.exports = class Trader {
    /**
     * Constructor for trader objects.
     * @param {State} state must be a state object.
     * @param {Array} resources must be an array of resource objects.
     * @param {Array} resourceComponents must be an array of component objects.
     */
    constructor(state, {resources = null, resourceComponents = null} = { }) {
        this.state = state;
        this.resources = resources;
        this.components = resourceComponents;

        if (this.resources) this.tradePower = this.getTradePower();
        else this.tradePower = 0;
    }

    /**
     * Gets the total trade power of the trader.
     * @returns {Number} double.
     */
    getTradePower() {
        let tradePower = 0;

        if (this.resources)
        {
            for (let resource of this.resources) {
                if (resource) tradePower += resource.tradePower;
            }
        }

        return tradePower;
    }
    
    /**
     * Sets the trade value of the trader.
     * Trade value is how much a trade agreement is worth to the state.
     * @param {Number} baseTradeValue must be an integer.
     */
    setTradeValue(baseTradeValue) {
        this.tradeValue = baseTradeValue * this.tradePower;
    }
};