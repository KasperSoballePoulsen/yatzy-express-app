const express = require('express');
const app = express();

const yatzyBrain = require('./yatzyBrain.js')

const fsPromises = require('node:fs/promises');
const fs = require('fs')
const path = require('path');
const session = require('express-session');
const Player = require('./player.js');
const { render } = require('pug');

app.use(express.static('assets'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');



app.use(session({
    secret: '196A9371-F1E1-4C4D-938A-F381F61919E6',  
    saveUninitialized: true,
    resave: true
}));

app.get('/', async (req, res) => {
    if (fs.existsSync(folderName)) {
        await createPlayers();
        res.redirect('/gamePage')
    } else {
        res.render('startPage', {
            title: 'Start page',
            users: yatzyBrain.users,
            script: '/js/startPage.js',
        });
    }
});

app.get('/gamePage', (req, res) => {
    req.session.currentPlayer = yatzyBrain.getCurrentPlayer()
    res.render('gamePage', {
        title: 'Game Page', 
        script: '/js/gamePage.js', 
        cssFil: '/css/gamePage.css', 
        playerName: yatzyBrain.getCurrentPlayer().playerName,
        rollsLeft: yatzyBrain.getCurrentPlayer().throwCount,
        holds: yatzyBrain.getCurrentPlayer().getHolds(),
        points: yatzyBrain.getCurrentPlayer().lockedPlayerPoints,
        sum: yatzyBrain.getCurrentPlayer().getSumUpper(),
        total: yatzyBrain.getCurrentPlayer().getTotalPoints(),
        diceValues: yatzyBrain.getCurrentPlayer().getDiceValues()
    });

})

app.get('/winnerPage', (req, res) => {
    let users = yatzyBrain.users;
    yatzyBrain.users = []
    yatzyBrain.currentTurnIndex = 0
    users = users.sort((a, b) => b.getTotalPoints() - a.getTotalPoints()).map(user => `${user.playerName}: ${user.getTotalPoints()} points`)
    res.render('winnerPage', {
        users: users, title: 'Winner Page'
    });
})



app.get('/rollDice', (req, res) => {
    yatzyBrain.getCurrentPlayer().throwDice()
    const diceValues = yatzyBrain.getCurrentPlayer().getDiceValues()
    const results = yatzyBrain.getResults(diceValues)
    const throwCount = yatzyBrain.getCurrentPlayer().throwCount
    gemSpiller()
    res.json({diceValues: diceValues , results: results, throwsLeft: throwCount});
})

app.put('/addPlayer', (req, res) => {
    const username = req.body.username.trim();
    if (username) {
        const playerToAdd = new Player(username)
        yatzyBrain.addPlayer(playerToAdd)
        res.json(yatzyBrain.getPlayerNames());
        gemSpiller(); 
    }
})




app.post('/endTurn', (req,res) => {
    const point = req.body.points
    const key = req.body.key
    yatzyBrain.getCurrentPlayer().addPoint(Number(point), key)
    gemSpiller();
    yatzyBrain.nextTurn();
    const keys = Object.keys(yatzyBrain.getCurrentPlayer().lockedPlayerPoints)
    if (keys.length === 16) {
        deletePlayerFiles()
        res.json({gameOver: true})
    } else {
        for (let die of yatzyBrain.getCurrentPlayer().gameDice) {
            die.isHold = false
        }
        yatzyBrain.getCurrentPlayer().setThrowCount(3)
        req.session.currentPlayer = yatzyBrain.getCurrentPlayer();  
        res.json({
            playerName: yatzyBrain.getCurrentPlayer().playerName,
            throwsLeft: yatzyBrain.getCurrentPlayer().throwCount,
            holds: yatzyBrain.getCurrentPlayer().getHolds(),
            lockedPlayerPoints: yatzyBrain.getCurrentPlayer().lockedPlayerPoints,
            sumUpper: yatzyBrain.getCurrentPlayer().getSumUpper(),
            total: yatzyBrain.getCurrentPlayer().getTotalPoints(),
            gameOver: false
        })   
    }
})

app.put('/updateHold', (req, res) => {
    const isHold = req.body.isHold
    const index = req.body.index - 1
    const spiller = yatzyBrain.getCurrentPlayer()
    spiller.gameDice[index].isHold = isHold
    gemSpiller()
    res.status(200).end()
})

const port = 8008
app.listen(port, () => { console.log(`Listening on port ${port}`);

});


const folderName = './YatzyFiler/spillere';



async function gemSpiller() {
    try {
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
        }
        const filePath = path.join(folderName, `${yatzyBrain.getCurrentPlayer().playerName}.txt`);
        const user = JSON.stringify({player: yatzyBrain.getCurrentPlayer()})
        await fs.promises.writeFile(filePath,user)
    } catch (err) {
        console.log(err);
    }
}



function deletePlayerFiles() {
    fs.rm(folderName, { recursive: true, force: true }, err => {
        if (err) {
            console.error(`Fejl ved sletning af mappen: ${err}`);
            return;
        }
        console.log(`${folderName} er blevet slettet!`);
    });
}


async function createPlayers() {
    try {
        const users = []
        const files = await fsPromises.readdir(folderName);
        
        for (const file of files) {
            const filePath = path.join(folderName, file);
            try {
                const fileContents = await fsPromises.readFile(filePath, 'utf8');
                const jsonObject = JSON.parse(fileContents);
                const playerId = jsonObject.player.playerId
                const playerName = jsonObject.player.playerName
                const lockedPlayerPoints = jsonObject.player.lockedPlayerPoints
                const sum = jsonObject.player.sum
                const throwCount = jsonObject.player.throwCount
                const gameDice = jsonObject.player.gameDice
                let player = new Player(playerName, playerId, lockedPlayerPoints, sum, throwCount, gameDice)
                users.push(player);
            } catch (err) {
                console.error(`Error reading or parsing file ${file}: ${err.message}`);
            }
        }
        users.sort((a,b) => a.playerId - b.playerId)
        yatzyBrain.users = users
        const currentUser = users.reduce((minUser, user) => {
            const minCount = Object.keys(minUser.lockedPlayerPoints).length;
            const userCount = Object.keys(user.lockedPlayerPoints).length;
            return userCount < minCount ? user : minUser;
        }, users[0]);
        yatzyBrain.currentTurnIndex = currentUser.playerId
    } catch (error) {
        return console.log("Fejl under hentning af spiller");
    }
}



