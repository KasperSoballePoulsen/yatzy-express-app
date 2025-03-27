class Die {

    constructor(eyesCount, isHold) {
        this.eyesCount = eyesCount
        this.isHold = isHold
    }

    setEyes(eyesNumber) {
        this.eyesCount = eyesNumber
    }

    setHold(hold) {
        this.isHold = hold
    }
}

module.exports = Die