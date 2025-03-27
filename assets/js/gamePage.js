const rollButton = document.querySelector('#roll')

rollButton.addEventListener('click', rollDice)

const pointFields = document.querySelectorAll('.pointField')

for (let pointField of pointFields) {
    pointField.addEventListener('click', endTurn)
}

const holdDice = document.querySelectorAll('.holdsCheckbox')

for (let holdsCheckbox of holdDice) {
    holdsCheckbox.addEventListener('click', sendHoldValue)
}


async function sendHoldValue(event) {
    const isHold = event.target.checked
    const eyeId = event.target.id
    const index = eyeId.charAt(eyeId.length - 1);
    await fetch('/updateHold', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({isHold: isHold, index: index})
    })
}

async function endTurn(event) {
    const pointChosen = event.target.value
    const inputName = event.target.name
    const res = await fetch('/endTurn', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({points: pointChosen, key: inputName})
    })
    const data = await res.json()
    if (data.gameOver === true) {
        window.location.href = '/winnerPage'
    } else {
    
    document.querySelector('#playerName').textContent = `Player: ${data.playerName}`;
    document.querySelector('#rollsLeft').textContent = `Rolls left: ${data.throwsLeft}`;
    const checkBoxes = document.querySelectorAll('.holdsCheckbox') 
    for (let i = 0; i < checkBoxes.length; i++) {
        checkBoxes[i].checked = data.holds[i]
    }
    for(let pointField of pointFields) {
        pointField.value = ''
        pointField.disabled = false
        pointField.readonly = true
    }
    const keys = Object.keys(data.lockedPlayerPoints);
    for (let key of keys) {
        let element = document.getElementById(key)
        if (key === 'bonus') {
            const disabled = data.lockedPlayerPoints[key] !== 0 ? true : false
            element.readonly = disabled ? false : true
            element.disabled = disabled
        } else {
            element.readonly = false
            element.disabled = true
            
        }
        element.value = data.lockedPlayerPoints[key]
        
    }
    document.querySelector('#sum').value = data.sumUpper
    document.querySelector('#total').value = data.total
    document.querySelector('#roll').disabled = false;
}
}



async function rollDice() {
    const res = await fetch('/rollDice', {
        method: 'GET'
    })
    const data = await res.json()
    const diceImages = document.querySelectorAll('.diceImg');
    data.diceValues.forEach((value, index) => {diceImages[index].src = `images/dice${value}.png`});
    data.results.forEach((value, index) => {
        if(!pointFields[index].disabled) {
            pointFields[index].value = value
        }
    })
    const rollsLeft = document.querySelector('#rollsLeft');
    rollsLeft.innerHTML = `Rolls left: ${data.throwsLeft}`
    if (data.throwsLeft === 0) {
        document.querySelector('#roll').disabled = true;
    }
}




