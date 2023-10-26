function stellariaText(txt){
    return "<h1 class=st>"+txt+"</h1>"
}

function wanderingText(txt){
    return "<h1 class=wander>"+txt+"</h1>"
}

addLayer("w", {
    name:"Wandering",
    symbol:"W",
    position: 0,
    startData(){
        return{
            unlocked: true,
            points: decimalOne,
            total: decimalOne,
            consume:new Decimal(0.01),
        }
    },
    color:"white",
    resource:"Journey",
    type:"none",

    clickables: {
        11: {
            title:"The stars sing your journey.",
            display() {return "<br>consume "+stellariaText(format(player.w.consume)+" Stellaria")+" to get "+wanderingText("1 Journey")},
            style(){
                return {'height':'140px',
                        'width':'280px'}
            },
            canClick(){
                return player.points.gte(player.w.consume)
            },
            onClick(){
                addPoints(this.layer, 1)
                player.points = decimalZero
                player.w.consume = player.w.consume.mul(new Decimal(10).pow(player.w.total.sub(decimalOne).add(1)))
            },

        }
    },
    

    upgrades:{
        11:{
            title:"beginning of wandering",
            description:"We are the Wanderer, walking among the stars.<br>In our journey, the starlight will shine us.",
            cost:new Decimal(1),

            style(){
                return {'height':'150px',
                        'width':'150px'}
            },

            effectDisplay(){
                return stellariaText(format(getPointGen())+"Stellaria")+" /s"
            },
        },
        
        12:{
            title:"Test",
            description:"TTT",
            cost:new Decimal(1),

            style(){
                return {'height':'150px',
                        'width':'150px'}
            },
        },

        21:{
            title:"Shining little stone",
            description:"This little blue stone...It's pretty unusual.<br>It looks similar to the stars watching us in the sky.",
            cost:new Decimal(0.001),

            style(){
                return {'height':'150px',
                        'width':'150px'}
            },

            currencyLocation(){ return player },
            currencyDisplayName: "Stellaria",
            currencyInternalName: "points",
        }
    },


    microtabs:{
        wander:{
            "Your Journey":{
                content:[
                    ["row",[["upgrade", 11], ["upgrade", 12]]]
                ],
            },
            "Starlight":{
                content:[
                    ["upgrade", 21],
                ],
                buttonStyle:{"border-color":"#276BE0"},
            }
        },
    },

    tabFormat:[
        "main-display",
        "clickables",
        ["display-text",
            function() {
                return "You are next Journey at "
            }
        ],
        "blank",
        //"upgrades"
        ["microtabs","wander"],
    ],

    row: 0,
    hotkeys: [
        {key: "w", description: "W: Reset for Wandering Layer", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
})


addLayer("v", {
    name: "Void", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "V", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            pilgrimage: false,
        }
    },
    branches: ["w"],
    color: "#390075",
    //requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "", // Name of prestige currency
    //baseResource: "void energy", // Name of resource prestige is based on
    //baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    //exponent: 0.5, // Prestige currency exponent

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
    layerShown(){return player.v.unlocked},

    upgrades: {
        rows : 3,
        cols : 3,
        12: {
            title: "End of Wandering",
            description: "우리는 희망을 찾아냈습니다.",
            cost: new Decimal(0),
            effect(){
                return true
            },
            effectDisplay(){
                return format(getPointGen()) + "/s"
            }
        },
        22:{
            title:"Purifier",
            description:"You will be able to purify the Void energy.",
            cost: new Decimal(3),
            currencyLocation() { return player },
            unlocked(){
                return hasUpgrade("v", 12)
            },
        },
        21:{
            title:"Purifier efficient",
            description:"",
        },
        23:{
            title:"Purifier intensify"
        }
    },
    milestones:{
        0:{
            requirementDescription:"required : 10 purified void",
            effectDescription:"unlock Void Well",
            done(){
                return player.v.points.gte(10)
            }
        },
    },

    tabFormat:{
        "Main":{
            content:[
                "main-display",
                "upgrades",
            ],

        },
        "Milsestones":{
            unlocked(){
                return hasMilestone("v", "0")
            },
            content:[
                "main-display",
                "milestones",
            ]
        }
    }
})
