const Die = require('./die.js')



class Player {
    static numberOfPlayers = 0

    constructor(playerName, playerId, lockedPlayerPoints, sum, throwCount, gameDice) {
        this.playerId = playerId || Player.numberOfPlayers
        this.playerName = playerName
        
        
        this.lockedPlayerPoints = lockedPlayerPoints || { bonus: 0};
        this.sum = sum || 0
        this.throwCount = throwCount || 3;
        this.gameDice = []
        if (gameDice) {
            for (let i = 0; i < 5; i++) {
                this.gameDice[i] = new Die(gameDice[i].eyesCount, gameDice[i].isHold)
            } 
        } else{
            for (let i = 0; i < 5; i++) {
                this.gameDice[i] = new Die( 0, false)
                this.gameDice[i].eyesCount = i + 1
            }
        }
    }

    addPoint(points, key) {
        this.lockedPlayerPoints[key] = points;
        if (this.lockedPlayerPoints.bonus === 0 && this.getSumUpper() >= 63) {
            this.lockedPlayerPoints.bonus = 50
        }
    }

    
        

    getTotalPoints() {
        let sum = 0;
        Object.keys(this.lockedPlayerPoints).forEach((key) => {
            sum += this.lockedPlayerPoints[key]
        });
        return sum
    }



    getSumUpper() {
        let sum = 0;
        Object.keys(this.lockedPlayerPoints).forEach((key) => {
            if (["s1", "s2", "s3", "s4", "s5", "s6"].includes(key)) {
                sum += this.lockedPlayerPoints[key]
            }
        });
        return sum
    }

    

    setPlayerName(name) {
        this.playerName = name; 
    }

    setThrowCount(throwsLeft) {
        this.throwCount = throwsLeft; 
    }

    getHolds() {
        const holds = [false, false, false, false, false]
        
        for (let i = 0; i < 5; i++) {

            holds[i] = this.gameDice[i].isHold
                
        }
        
        return holds
    }

    throwDice() {
        if (this.throwCount > 0) {
            for (let die of this.gameDice) {
                if (!die.isHold) {
                    die.eyesCount = Math.floor(Math.random() * 6 + 1)
                }
            }
            this.throwCount--;
        }
    }
    
    getDiceValues() {
        const diceValues = []
        for (let i = 0; i < this.gameDice.length; i++) {
            diceValues[i] = this.gameDice[i].eyesCount
        }
        return diceValues
    }

}

module.exports = Player;




