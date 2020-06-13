const readlineSync = require('readline-sync');
const colors = require('colors');

let gameState = {
    playerName: 'Player',
    cpuName: 'Computer',

    deck: null,
    playerHand: null,
    cpuHand: null,

    isGameOver: false,
    isPlayerTurn: false,
    isCpuTurn: false,
};

const cardBack = '◊◊◊◊'.white.bgCyan;

const createDeck = () => {
    const deck = [];
    const suites = ['♠', '♥', '♦', '♣'];
    const displayNum = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const values = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];

    for (let s = 0; s < suites.length; s++) {
        const thisSuite = suites[s];

        for (let c = 0; c < 13; c++) {
            let pre = c === 9 ? '' : ' ';
            const display =
                thisSuite === '♥' || thisSuite === '♦'
                    ? ` ${thisSuite}${displayNum[c]}${pre}`.red.bgWhite
                    : ` ${thisSuite}${displayNum[c]}${pre}`.black.bgWhite;
            const thisCard = {
                display,
                value: values[c],
            };
            deck.push(thisCard);
        }
    }

    return deck;
};

const shuffleDeck = (deck) => {
    return deck.sort(() => Math.random() - 0.5);
};

const drawSingleCard = (deck) => {
    return deck.pop();
};

const drawCards = (deck, totalCards = 1) => {
    const cards = [];
    for (let c = 0; c < totalCards; c++) {
        cards.push(drawSingleCard(deck));
    }
    return cards;
};

const cpuHandShown = (hand) => {
    return hand.slice(1, hand.length);
};

const getHandValue = (hand) => {
    return hand.reduce((prev, current) => {
        return (prev += current.value);
    }, 0);
};

const readlineInput = () => {
    const hos = readlineSync.question('What would you like to do?\n(H)it  (S)tay  (Q)uit\n');
    switch (hos.toLocaleLowerCase()) {
        case 'quit':
        case 'q':
            console.log('\n');
            console.log('Goodbye.');
            process.exit(0);
            break;
        case 'hit':
        case 'h':
            return 'hit';
            break;
        case 'stay':
        case 's':
            return 'stay';
            break;
        default:
            console.log('I did not understand.\n');
            return null;
            break;
    }
};
const getPlayerInput = () => {
    const theInput = readlineInput();
    if (theInput != null) return theInput;
};

const handLogSmall = (hand, isCpu = false) => {
    const initialVal = isCpu && !gameState.isGameOver ? cardBack + ' ' : '';
    const adjustedHand = isCpu && !gameState.isGameOver ? cpuHandShown(hand) : hand;
    const handDisplay = adjustedHand.reduce((total, current) => {
        const card = `${current.display} `;
        total += card;
        return total;
    }, initialVal);

    return handDisplay;
};

const handLogBig = (hand, isCpu = false) => {
    const initialVal = isCpu && !gameState.isGameOver ? cardBack + ' ' : '';
    const adjustedHand = isCpu && !gameState.isGameOver ? cpuHandShown(hand) : hand;

    let handTopBot = isCpu && !gameState.isGameOver ? cardBack + ' ' : '';
    const handDisplay = adjustedHand.reduce((total, current) => {
        const card = `${current.display} `;
        handTopBot += '    '.bgWhite + ' ';
        total += card;
        return total;
    }, initialVal);

    return `${handTopBot}\n ${handDisplay}\n ${handTopBot}`;
};

const logHands = () => {
    console.log(`${gameState.cpuName}'s hand:\n`, handLogBig(gameState.cpuHand, true));
    console.log('');
    console.log(`${gameState.playerName}'s hand:\n`, handLogBig(gameState.playerHand));
};

const isBusted = (hand) => {
    return getHandValue(hand) > 21;
};

const checkForBlackjack = () => {
    // Check for BackJack -------
    let winner = null;
    let playerWon = false;
    let cpuWon = false;

    if (getHandValue(gameState.playerHand) === 21) {
        console.log('----------------------');
        console.log(`${gameState.playerName} has BLACKJACK!!!`);
        playerWon = true;
        winner = 'player';
    }
    if (getHandValue(gameState.cpuHand) === 21) {
        console.log('----------------------');
        console.log(`${gameState.cpuName} has BLACKJACK!!!`);
        cpuWon = true;
        winner = 'cpu';
    }
    if (playerWon && cpuWon) {
        winner = 'draw';
        console.log('----------------------');
        console.log(
            'ITS A BLACKJACK DRAW!!!\nWhat are the odds?!\nActually, 8.48% of BlackJack games end in a draw.'
        );
    }

    return winner;
};

const initRound = () => {
    console.clear();
    console.log('----------------------');
    console.log('Welcome to Black Jack!');
    console.log('----------------------\n');

    const deck = shuffleDeck(createDeck());

    let playerHand = [];
    let cpuHand = [];

    let playerWon = false;
    let cpuWon = false;

    playerHand = drawCards(deck, 2);
    cpuHand = drawCards(deck, 2);

    gameState = { ...gameState, deck, playerHand, cpuHand, isPlayerTurn: true };
    logHands();
};

const aceBase = (hand) => {
    // If we busted - check for and downplay an ace
    if (getHandValue(hand) > 21) {
        hand.map((card) => {
            if (card.value === 11) {
                card.value = 1;
                return hand;
            }
        });
    }
    return hand;
};

const endGameState = () => {
    gameState = {
        ...gameState,
        isPlayerTurn: false,
        isCpuTurn: false,
        isGameOver: true,
    };
};

const playBlackJack = () => {
    // Shuffle and Draw
    initRound();

    // Check for Ace of the Base
    aceBase(gameState.playerHand);
    aceBase(gameState.cpuHand);

    // Check for Black Jack on Either Side
    const instantWinner = checkForBlackjack();

    if (instantWinner) {
        console.log('----------------------\n');
        gameState = {
            ...gameState,
            isPlayerTurn: false,
            isCpuTurn: false,
            isGameOver: true,
        };
        logHands();
    }
    // Player Turn
    while (gameState.isPlayerTurn) {
        console.log('----------------------\n');

        let playerMove = getPlayerInput();

        switch (playerMove) {
            case 'hit':
                const drawnCard = drawCards(gameState.deck, 1);
                console.log(`${gameState.playerName} HITS and draws ${handLogSmall(drawnCard)}\n`);
                let updatedHand = [...gameState.playerHand, ...drawnCard];

                // If we busted - check for and downplay an ace
                if (getHandValue(updatedHand) > 21) {
                    updatedHand = aceBase(updatedHand);
                }

                gameState = { ...gameState, playerHand: updatedHand };

                if (isBusted(updatedHand)) {
                    endGameState();
                    logHands();
                    console.log(`*** ${gameState.playerName} BUSTED!!! ***`);
                } else {
                    logHands();
                }

                break;
            case 'stay':
                console.log(`${gameState.playerName} STAYS...\n`);
                gameState = { ...gameState, isPlayerTurn: false, isCpuTurn: true };
                break;
        }
    }

    // CPU Turn
    while (gameState.isCpuTurn) {
        console.log('----------------------\n');

        // Stay on 17 or higher, that's my AI
        let cpuMove = getHandValue(gameState.cpuHand) >= 17 ? 'stay' : 'hit';

        switch (cpuMove) {
            case 'hit':
                const drawnCard = drawCards(gameState.deck, 1);
                console.log(`${gameState.cpuName} HITS and draws ${handLogSmall(drawnCard)}\n`);
                let updatedHand = [...gameState.cpuHand, ...drawnCard];

                // If we busted - check for and downplay an ace
                if (getHandValue(updatedHand) > 21) {
                    updatedHand = aceBase(updatedHand);
                }

                gameState = { ...gameState, cpuHand: updatedHand };

                if (isBusted(updatedHand)) {
                    endGameState();
                    logHands();
                    console.log(`*** ${gameState.cpuName} BUSTED!!! ***`);
                } else {
                    logHands();
                }
                break;

            case 'stay':
                console.log(`${gameState.cpuName} STAYS...\n`);
                endGameState();
                logHands();
                break;
        }
    }

    console.log(`${gameState.playerName}: ${getHandValue(gameState.playerHand)}`);
    console.log(`${gameState.cpuName}: ${getHandValue(gameState.cpuHand)}`);

    const playerWins =
        (21 - getHandValue(gameState.playerHand) < 21 - getHandValue(gameState.cpuHand) &&
            getHandValue(gameState.playerHand) < 22) ||
        getHandValue(gameState.cpuHand) > 21;

    if (getHandValue(gameState.playerHand) === getHandValue(gameState.cpuHand)) {
        console.log(`It's a draw... in this case, the house takes it.`);
    }
    if (playerWins) {
        console.log(`Well played ${gameState.playerName}. You win.`);
    } else {
        console.log(
            `Better luck next time ${gameState.playerName}. ${gameState.cpuName} wins this time.`
        );
    }

    console.log('*** GAME OVER ***');
    process.exit(0);
};

playBlackJack();

/*

 - init / player, deck, etc
 - game loop
   - shuffle cards
   - player draw
   - cpu draw
   - check instant wins
   - player turn
     - player input
     - check bust or win
     - player input (loop)
   - cpu turn
     - check bust or win
     - cpu turn (loop)

*/
