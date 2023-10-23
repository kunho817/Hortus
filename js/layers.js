addLayer("v", {
    name: "Void", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "V", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
        }
    },
    color: "#390075",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "purified void", // Name of prestige currency
    baseResource: "void energy", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent

    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    row: 0, // Row the layer is in on the tree (0 is the first row)

    hotkeys: [
        {key: "v", description: "V: Reset for Void Layer", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    upgrades: {
        rows : 1,
        cols : 1,
        11: {
            title: "In to the Void",
            description: "Gain 0.1 void energy/s.",
            cost: new Decimal(1),
            effect(){
                return true
            },
            effectDisplay(){
                return format(getPointGen()) + "/s"
            }
        }
    }
})
