//Check all protocols are defined
const getProtocols = (protocols) => {
    const protocolsValid = ["closest-enemies", "furthest-enemies", "assist-allies", "avoid-crossfire", "prioritize-mech", "avoid-mech"]
    const valid = protocols.map((p) => {
        if (protocolsValid.includes(p)) {
            return true
        }
        return false
    })
    return valid.every(v => v === true)
}

//Calculate the distance from origin in Cartesian plane
const calculateDistance = (point) => {
    const origin = { x: 0, y: 0 }
    const distance = Math.sqrt((Math.pow((point.x - origin.x), 2)) + (Math.pow((point.y - origin.y), 2)))
    return distance
}

//Check that the attack does not exceed 100 meters
const checkFurtherDistance = (scan) => {
    let validCoordinates = []
    scan.map((a) => {
        let num = calculateDistance(a.coordinates)
        if (num <= 100){
            validCoordinates.push(scan.filter(b => b.coordinates === a.coordinates)[0])
        }
        else{
            null
        }
    })
    return validCoordinates
}

//The coordinates are ordered so that it comes out with format (x,y) and... tests.sh it's OK
const orderedCoord = (coord) => {
    let ordened = Object.keys(coord).sort().reduce(
        (obj, key) => {
        obj[key] = coord[key]
        return obj
        },
        {}
    )
    return ordened
}

//Find out coordinates with closest enemies
const closestEnemies = (attack) => {
    let longest = 100
    let coordAttack = {}
    attack.scan.map(a => {
        const num = calculateDistance(a.coordinates)
        if (num < longest) {
            longest = num
            coordAttack = a.coordinates
        return coordAttack
        }
    })
    return orderedCoord(coordAttack)
}

//Find out coordinates with furthest enemies
const furthestEnemies = (attack) => {
    let closest = 0
    let coordAttack = {}
    attack.scan.map(a => {
        const num = calculateDistance(a.coordinates)
        if (num > closest){
            closest = num
            coordAttack = a.coordinates
        }
        return coordAttack
    })
    return orderedCoord(coordAttack)
}

//Search coordinates with allies
const assistAllies = (attack) => {
    let alliesCoord = []
    attack.scan.filter(a => {
        if(a.allies !== undefined){
            alliesCoord.push(a)
        }
    })
    //In no allies is found in the sent coordenates, return all coordinates
    if(alliesCoord.length === 0){
        return attack
    }
    let validAttack = {...attack, scan: alliesCoord}
    return validAttack
}

//Search coordinates without allies
const avoidCrossFire = (attack) => {
    let noAlliesCoord = []
    attack.scan.filter(a => {
        if(a.allies === undefined){
            noAlliesCoord.push(a)
        }
    })
    //If there is any coordinate with allies, no attack occurs
    if(noAlliesCoord.length === 0){
        return false
    }
    let validAttack = {...attack, scan: noAlliesCoord}
    return validAttack
}

//Search coordinates with mech
const prioritizeMech = (attack) => {
    let mechCoord = []
    attack.scan.filter(a => {
        if(a.enemies.type === "mech"){
            mechCoord.push(a)
        }
    })
    //If no mech are found, attack any coordinate
    if(mechCoord.length === 0){
        return attack
    }
    let validAttack = {...attack, scan: mechCoord}
    return validAttack
}

//Search coordinates with mech
const avoidMech = (attack) => {
    let noMechCoord = []
    attack.scan.filter(a => {
        if(a.enemies.type !== "mech"){
            noMechCoord.push(a)
        }
    })
    //No mech enemies should be attacked
    if(noMechCoord.length === 0){
        return false
    }
    let validAttack = {...attack, scan: noMechCoord}
    return validAttack
}


const getProtocol = (req, res, next) => {
    //Discard that protocols are not empty
    if (!req.body.protocols || req.body.protocols.length === 0) {
        res.status(404).json({"error":"Commander Lando Calrissian, there are no protocols in the order."})
    }

    //Check that the protocols are correct
    const protocolsCorrect = getProtocols(req.body.protocols)

    if(protocolsCorrect !== true){
        res.status(404).json({"error":"Commander Lando Calrissian, the protocols are incorrect."})
    }

    //Check that the attack does not exceed 100 meters
    const validProtocols = checkFurtherDistance(req.body.scan)
    const correctProtocols = {...req.body, scan: validProtocols}

    //Check protocols and attacks coordenates
    let attack
    attack = false

    if ( correctProtocols.protocols.includes("assist-allies") ) {
        attack = assistAllies(correctProtocols)
    }
    if ( correctProtocols.protocols.includes("avoid-crossfire") ) {
        //Check that there are no coordinates without allies
        avoidCrossFire(correctProtocols) ? attack = avoidCrossFire(correctProtocols) : res.status(404).json({"error":"There are no coordinates without allies"})
    }

    if ( correctProtocols.protocols.includes("prioritize-mech") ) {
        attack === false ? attack = prioritizeMech(correctProtocols) : attack = prioritizeMech(attack)
    }
    if ( correctProtocols.protocols.includes("avoid-mech") ) {
        attack === false ? attack = avoidMech(correctProtocols) : attack = avoidMech(attack)
        if ( !attack ) {
            //There are no coordinates without mech
            res.status(404).json({"error":"There are no coordinates without mech"})
        }
    }

    if ( correctProtocols.protocols.includes("furthest-enemies") ) {
        attack === false ? attack = furthestEnemies(correctProtocols) : attack = furthestEnemies(attack)
    }
    if ( correctProtocols.protocols.includes("closest-enemies") ) {
        attack === false ? attack = closestEnemies(correctProtocols) : attack = closestEnemies(attack)
    }

    //There can be more than one coordinate and usually... nearby targets take down better
    if ( attack && correctProtocols.protocols.length === 1 && !( correctProtocols.protocols.includes("closest-enemies") || correctProtocols.protocols.includes("furthest-enemies") ) ) {
        attack = closestEnemies(attack)
    }

    if (attack) {
        res.status(200).json(attack)
    }

    next()
}

module.exports = getProtocol