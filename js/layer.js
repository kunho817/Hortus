function stellariaText(txt){
    return "<h1 class=st>"+txt+"</h1>"
}

function wanderingText(txt){
    return "<h1 class=wander>"+txt+"</h1>"
}

// Wandering Layer 함수 모음
function hasJourneyUpgrade(id){
    return getClickableState("w", id) == "On"
}

function setJourneyUpgrade(id){
    setClickableState("w", id, "On")
}

function canBuyJourney(amount, id){
    return (player.w.points.gte(amount) && !hasJourneyUpgrade(id))
}

function canBuyFootprints(amount, id){
    return (player.w.distance.gte(amount) && !hasJourneyUpgrade(id))
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
            consume:new Decimal(5),

            distance:decimalZero,
            dispersec:decimalZero,

            footprints:decimalZero,
            journeys:decimalZero,
            
        }
    },
    color:"white",
    resource:"Journey",
    type:"none",

    update(delta){
        player.w.distance = player.w.distance.add(player.w.dispersec.mul(delta))

        let tdisps = new Decimal(0)

        if(hasJourneyUpgrade(101))
        {
            tdisps = new Decimal(0.1)
            if(hasJourneyUpgrade(102)) tdisps = tdisps.mul(2)
            if(hasJourneyUpgrade(103)) tdisps = tdisps.mul(clickableEffect(this.layer, 103))
            if(hasJourneyUpgrade(105)) tdisps = tdisps.mul(2)
            if(hasJourneyUpgrade(106)) tdisps = tdisps.mul(player.points.log10().mul(3))
        }

        player.w.dispersec = tdisps
    },

    clickables: {
        11: {
            display() {
                if(this.canClick())
                    return "<font size=2.5px><b>The stars sing your journey.</b></font><br><br>consume "+stellariaText(format(player.w.consume)+" Starlight")+" to get "+wanderingText("1 Journey")
                else
                    return "<font size=2.5px><b>It's not time yet.</b></font><br><br>"+stellariaText(format(player.points)+" / "+format(player.w.consume)+" Starlight")
            },
            style(){
                return {'height':'140px',
                        'width':'280px'}
            },
            canClick(){
                return player.w.distance.gte(player.w.consume)
            },
            onClick(){
                addPoints(this.layer, 1)
                player.w.consume = player.w.consume.mul(new Decimal(10).pow(player.w.total.sub(decimalOne)))
            },

        },
        21:{
            display(){
                if(this.canClick())
                    return "<font size=2.5px><b>Tune the starlight to create Stellaria.</b></font>"
                else
                    return "<font size=2.5px><b>It's just a starlight yet.</b></font>"
            },
            style(){
                if(this.canClick())
                    return {'height':'70px',
                            'width':'200px',
                            'background-color':'#276BE0'}
                else
                    return {'height':'70px',
                            'width':'200px',}
            },
            canClick(){
                return player.points.gte(1)
            },
            onClick(){
                
            },
            unlocked(){
                return true
            },
        },

        //#region 여정 업그레이드 트리
        //#region 방랑의 시작
        101:{
            title:"Beginning of wandering",
            display(){
                return "끼얏호"
            },
            canClick(){
                return canBuyJourney(1, 101)
            },
            onClick(){
                player.w.points = player.w.points.sub(1)
                player.w.journeys = player.w.journeys.add(1)
                setJourneyUpgrade(101)
            },
            style(){
                if(hasJourneyUpgrade(101)){
                    return {
                        'background-color':'#77BF5F'
                    }
                }
            },
        },

        102:{
            title:"11",
            display(){
                
            },
            canClick(){
                return canBuyFootprints(1, 102)
            },
            onClick(){
                player.w.footprints = player.w.footprints.add(1)
                setJourneyUpgrade(102)
            },
            style(){
                if(hasJourneyUpgrade(102)){
                    return {
                        'background-color':'#77BF5F'
                    }
                }
            },
            unlocked(){
                return hasJourneyUpgrade(101)
            },
            branches:[101],
        },
        103:{
            title:"21",
            display(){
                return format(clickableEffect("w", 103))
            },
            canClick(){
                return canBuyFootprints(1, 103)
            },
            onClick(){
                player.w.footprints = player.w.footprints.add(1)
                setJourneyUpgrade(103)
            },
            effect(){
                return player.w.footprints.pow(0.5)
            },
            style(){
                if(hasJourneyUpgrade(103)){
                    return {
                        'background-color':'#77BF5F'
                    }
                }
            },
            unlocked(){
                return hasJourneyUpgrade(102)
            },
            branches:[102],
        },
        //#endregion

        //#region 별무리가 내리는 곳
        104:{
            title:"A Place where stars fall",
            display(){
                
            },
            canClick(){
                return canBuyJourney(1, 104)
            },
            onClick(){
                player.w.points = player.w.points.sub(1)
                player.w.journeys = player.w.journeys.add(1)
                setJourneyUpgrade(104)
            },
            style(){
                if(hasJourneyUpgrade(104)){
                    return {
                        'background-color':'#77BF5F'
                    }
                }
            },
            unlocked(){
                return hasJourneyUpgrade(103)
            },
            branches:[103],
        },

        //#region 별무리가 내리는 곳 - 별빛으로 향하리 분기
        105:{
            title:"31",
            display(){
                
            },
            canClick(){
                return canBuyFootprints(1, 105)
            },
            onClick(){
                player.w.footprints = player.w.footprints.add(1)
                setJourneyUpgrade(105)
            },
            effect(){
                
            },
            style(){
                if(hasJourneyUpgrade(105)){
                    return {
                        'background-color':'#77BF5F'
                    }
                }
            },
            unlocked(){
                return hasJourneyUpgrade(104)
            },
            branches:[104],
        },
        106:{
            title:"별빛으로 향하리",
            display(){
                
            },
            canClick(){
                return canBuyJourney(1, 106)
            },
            onClick(){
                player.w.points = player.w.points.sub(1)
                player.w.journeys = player.w.journeys.add(1)
                setJourneyUpgrade(106)
            },
            effect(){
                
            },
            style(){
                if(hasJourneyUpgrade(106)){
                    return {
                        'background-color':'#77BF5F'
                    }
                }
            },
            unlocked(){
                return hasJourneyUpgrade(105)
            },
            branches:[105],
        },
        107:{
            title:"41",
            display(){
                
            },
            canClick(){
                return canBuyJourney(1, 107)
            },
            onClick(){
                player.w.footprints = player.w.footprints.add(1)
                setJourneyUpgrade(107)
            },
            effect(){
                
            },
            style(){
                if(hasJourneyUpgrade(107)){
                    return {
                        'background-color':'#77BF5F'
                    }
                }
            },
            unlocked(){
                return hasJourneyUpgrade(106)
            },
            branches:[106],
        },
        //#endregion


        
        //#endregion

        //#endregion
    },

    upgrades:{
        
    },
/*
    upgrades:{
        11:{
            title:"beginning of wandering",
            description:"We are the Wanderer, walking among the stars.<br>In our journey, the starlight will shine us.",
            cost:new Decimal(1),

            style(){
                return {'height':'135px',
                        'width':'135px'}
            },

            effectDisplay(){
                return stellariaText(format(getPointGen())+"Starlight")+" /s"
            },
        },
        
        12:{
            title:"Test",
            description:"TTT",
            cost:new Decimal(1),

            style(){
                return {'height':'135px',
                        'width':'135px'}
            },
        },

        21:{
            title:"Shining little stone",
            description:"This little blue stone...It's pretty unusual.<br>It looks similar to the stars watching us in the sky.",
            cost:new Decimal(0.001),

            style(){
                return {'height':'135px',
                        'width':'135px'}
            },

            currencyLocation(){ return player },
            currencyDisplayName: "Starlight",
            currencyInternalName: "points",
        }
    },*/


    microtabs:{
        wander:{
            "Your Journey":{
                content:[
                    ["raw-html",
                    function(){
                        let a = format(player.w.footprints, 0)+" footprints life you leave behind"
                        return a
                    }],
                    ["clickable-tree", [
                        [101],
                            [102],[103],
                        [104],
                            [105],
                            [106],
                            [107],
                    ]]
                    
                ],
            },
            "Starlight":{
                content:[
                    ["clickable", 21],
                    ["upgrade", 21],
                ],
                buttonStyle:{"border-color":"#276BE0"},
            }
        },
    },

    tabFormat:[
        ["raw-html",
        function() {
            let a = "You travled "+format(player.w.distance)+" Distance<br>"
            let b = "We're taking "+format(player.w.dispersec)+" distance forward.<br>"
            let c = "You've been through "+format(player.w.total, 0)+" Journey<br>"
            let d = "You have "+format(player.w.points, 0)+" Journey<br>"
            return a+b+c+d
        }],
        ["clickable", 11],
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
