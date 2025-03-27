

class YatzyBrain {
    
    static users = [];
    static currentTurnIndex = 0;
 
        

    static addPlayer(player) {
        if (!player || typeof player !== 'object') {
            throw new Error("Ugyldig spiller.");
        }

        this.users.push(player);
        this.nextTurn()
    }


    static nextTurn() {
        if (this.users.length === 0) {
            throw new Error("Ingen spillere i spillet.");
        }
        this.currentTurnIndex = (this.currentTurnIndex + 1) % this.users.length;
    }


    static getCurrentPlayer() {
        if (this.users.length === 0) {
            return null;
        }
        return this.users[this.currentTurnIndex];
    }

    static getPlayerNames() {
        const playerNames = []
        for (let i = 0; i < this.users.length; i++) {
            playerNames[i] = this.users[i].playerName
        }
        return playerNames
    }

    

    static frequency(diceValues) {
        const freq = new Array(7).fill(0);
        for (let i = 0; i < diceValues.length; i++) {
            freq[diceValues[i]]++;
        }
        return freq;
    }

    static sameValuePoints(value, diceValues) {
        return YatzyBrain.frequency(diceValues)[value] * value;
    }

    static onePairPoints(diceValues) {
        const freq = YatzyBrain.frequency(diceValues);
        let points = 0;
        for (let i = 1; i <= 6; i++) {
            if (freq[i] > 1) {
                points = i * 2;
            }
        }
        return points;
    }

    static twoPairPoints(diceValues) {
        const freq = YatzyBrain.frequency(diceValues);
        let points = 0;
        let pairs = 0;
        for (let i = 1; i < freq.length; i++) {
            if (freq[i] > 1) {
                points += i * 2;
                pairs++;
            }
        }
        if (pairs < 2) {
            points = 0;
        }
        return points;
    }

    static threeSamePoints(diceValues) {
        const freq = YatzyBrain.frequency(diceValues);
        let points = 0;
        for (let i = 1; i < freq.length; i++) {
            if (freq[i] > 2) {
                points = i * 3;
            }
        }
        return points;
    }

    static fourSamePoints(diceValues) {
        const freq = YatzyBrain.frequency(diceValues);
        let points = 0;
        for (let i = 1; i < freq.length; i++) {
            if (freq[i] > 3) {
                points = i * 4;
            }
        }
        return points;
    }

    static fullHousePoints(diceValues) {
        const freq = YatzyBrain.frequency(diceValues);
        let points = 0;
        let threeOfAKind = 0;
        let twoOfAKind = 0;
        for (let i = 1; i <= 6; i++) {
            if (freq[i] === 3) {
                threeOfAKind = i;
            }
            if (freq[i] === 2) {
                twoOfAKind = i;
            }
        }
        if (threeOfAKind && twoOfAKind) {
            points = threeOfAKind * 3 + twoOfAKind * 2;
        }
        return points;
    }

    static smallStraightPoints(diceValues) {
        const freq = YatzyBrain.frequency(diceValues);
        if (freq.slice(1, 6).every(f => f === 1)) {
            return 15;
        }
        return 0;
    }

    static largeStraightPoints(diceValues) {
        const freq = YatzyBrain.frequency(diceValues);
        if (freq.slice(2, 7).every(f => f === 1)) {
            return 20;
        }
        return 0;
    }

    static chancePoints(diceValues) {
        return diceValues.reduce((sum, value) => sum + value, 0);
    }

    static yatzyPoints(diceValues) {
        const freq = YatzyBrain.frequency(diceValues);
        if (freq.some(f => f === 5)) {
            return 50;
        }
        return 0;
    }

    static getResults(diceValues) {
        let results = [];
        for (let i = 0; i <= 5; i++) {
            results[i] = YatzyBrain.sameValuePoints(i + 1, diceValues);
        }
        results[6] = YatzyBrain.onePairPoints(diceValues);
        results[7] = YatzyBrain.twoPairPoints(diceValues);
        results[8] = YatzyBrain.threeSamePoints(diceValues);
        results[9] = YatzyBrain.fourSamePoints(diceValues);
        results[10] = YatzyBrain.fullHousePoints(diceValues);
        results[11] = YatzyBrain.smallStraightPoints(diceValues);
        results[12] = YatzyBrain.largeStraightPoints(diceValues);
        results[13] = YatzyBrain.chancePoints(diceValues);
        results[14] = YatzyBrain.yatzyPoints(diceValues);
    
        return results;
    }
}


module.exports = YatzyBrain;
