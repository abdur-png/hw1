// game.mjs
import { generateDeck, shuffle, deal, draw } from '../lib/cards.mjs';
import { question } from 'readline-sync';
import clear from 'clear';
import { readFile } from 'fs';

const predefinedGameState = process.argv[2];
let gameState;
if (predefinedGameState) {
    readFile(predefinedGameState, 'utf8', (err, data) => {
        if (err) throw err;
        gameState = JSON.parse(data);
        displayGameState();
        playerTurn();
        computerTurn();

    });
}
else {
    const deck = shuffle(generateDeck());
    const { deck: newDeck, hands: [playerHand] } = deal(deck);
    const { deck: finalDeck, hands: [computerHand] } = deal(newDeck);
    
    let discardPile = [];
    let starterCard = draw(finalDeck)[1][0];
    while (starterCard.rank === '8') {
        discardPile.push(starterCard);
        starterCard = draw(finalDeck)[1][0];
    }
    discardPile.push(starterCard);
    gameState = {
        deck: finalDeck,
        playerHand: playerHand,
        computerHand: computerHand,
        discardPile: discardPile,
        nextPlay: starterCard
    };
    displayGameState();
    playerTurn();
    computerTurn();

}
function displayGameState() {
    
    clear();
    console.log("              CR🤪ZY 8's");
    console.log("-----------------------------------------------");
    console.log(`Next suit/rank to play: ➡️  ${gameState.nextPlay.rank}${gameState.nextPlay.suit}  ⬅️`);
    console.log("-----------------------------------------------");
    console.log(`Top of discard pile: ${gameState.discardPile[gameState.discardPile.length - 1].rank}${gameState.discardPile[gameState.discardPile.length - 1].suit}`);
    console.log(gameState.discardPile)
    console.log(`Number of cards left in deck: ${gameState.deck.length}`);
    console.log("-----------------------------------------------");
    console.log(`🤖✋ (computer hand): ${gameState.computerHand.map(card => card.rank + card.suit).join('  ')}`);
    console.log(`😊✋ (player hand): ${gameState.playerHand.map(card => card.rank + card.suit).join('  ')}`);
    console.log("-----------------------------------------------");
}

// 4. Player's Turn
function playerTurn() {
    const playableCards = gameState.playerHand.filter(card => 
        card.rank === gameState.nextPlay.rank || 
        card.suit === gameState.nextPlay.suit || 
        card.rank === '8'
    );

    if (playableCards.length > 0) {
        console.log("😊 Player's turn...");
        console.log("Enter the number of the card you would like to play");
        playableCards.forEach((card, index) => {
            console.log(`${index + 1}: ${card.rank}${card.suit}`);
        });
        const choice = parseInt(question("> "));
        const playedCard = gameState.playerHand.splice(gameState.playerHand.indexOf(playableCards[choice - 1]), 1)[0];
        gameState.discardPile.push(playedCard);
        
        if (playedCard.rank === '8') {
            console.log("CRAZY EIGHTS! You played an 8 - choose a suit");
            console.log("1: ♠️\n2: ❤️\n3: ♣️\n4: ♦️");
            const suitChoice = parseInt(question("> "));
            const suits = ["♠️", "❤️", "♣️", "♦️"];
            gameState.nextPlay = { rank: '8', suit: suits[suitChoice - 1] };
        } else {
            gameState.nextPlay = playedCard;
        }
    } else {
        console.log(`😊 Player's turn...`);
        console.log(`😔 You have no playable cards`);
        let drawnCards = [];
        let playable = false;
        while (!playable && gameState.deck.length) {
            const [newDeck, card] = draw(gameState.deck);
            gameState.deck = newDeck;
            drawnCards.push(card[0]);
            // drawnCards = [card[0], ...drawnCards];
            if (card[0].rank === gameState.nextPlay.rank || card[0].suit === gameState.nextPlay.suit || card[0].rank === '8') {
                playable = true;
                gameState.discardPile.push(card[0]);
                gameState.nextPlay = card[0];
            }
        }
        console.log(`Cards drawn: ${drawnCards.map(card => card.rank + card.suit).join(', ')}`);
        if (playable) {
            console.log(`Card played: ${gameState.nextPlay.rank}${gameState.nextPlay.suit}`);
            
        }
        question("Press ENTER to continue");
        if (gameState.nextPlay.rank === '8') {
            console.log("CRAZY EIGHTS! You played an 8 - choose a suit");
            console.log("1: ♠️\n2: ❤️\n3: ♣️\n4: ♦️");
            const suitChoice = parseInt(question("> "));
            const suits = ["♠️", "❤️", "♣️", "♦️"];
            gameState.nextPlay = { rank: '8', suit: suits[suitChoice - 1] };
        }

        // playerTurn();
    }
}

// 5. Computer's Turn
function computerTurn() {
    const playableCardIndex = gameState.computerHand.findIndex(card => 
        card.rank === gameState.nextPlay.rank || 
        card.suit === gameState.nextPlay.suit || 
        card.rank === '8'
    );

    if (playableCardIndex !== -1) {
        const playedCard = gameState.computerHand.splice(playableCardIndex, 1)[0];
        gameState.discardPile.push(playedCard);
        
        if (playedCard.rank === '8') {
            // For simplicity, let's choose the most common suit in the computer's hand
            const suitCounts = gameState.computerHand.reduce((acc, card) => {
                acc[card.suit] = (acc[card.suit] || 0) + 1;
                return acc;
            }, {});
            const mostCommonSuit = Object.keys(suitCounts).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b);
            gameState.nextPlay = { rank: '8', suit: mostCommonSuit };
        } else {
            gameState.nextPlay = playedCard;
        }
        
        console.log(`🤖 Computer's turn...`);
        console.log(`Card played: ${playedCard.rank}${playedCard.suit}`);
    } 
    else {
        // console.log(`🤖 Computer's turn...`);
        // console.log(`😔 No playable cards`);
        
        let drawnCard;
        let playable = false;
        while (!playable && gameState.deck.length) {
            [gameState.deck, drawnCard] = draw(gameState.deck);
            gameState.computerHand.push(drawnCard[0]);
            if (drawnCard[0].rank === gameState.nextPlay.rank || drawnCard[0].suit === gameState.nextPlay.suit || drawnCard[0].rank === '8') {
                playable = true;
                gameState.discardPile.push(drawnCard[0]);
                gameState.nextPlay = drawnCard[0];
            }
        }
        if (playable) {
            console.log(`🤖 Computer's turn...`);
            console.log(`Card drawn and played: ${drawnCard[0].rank}${drawnCard[0].suit}`);
        } else {
            console.log(`🤖 Computer's turn...`);
            console.log(`😔 No playable cards`);
            console.log(`Cards drawn but no playable card found.`);
        }
    }
}

// displayGameState();
// playerTurn();
// computerTurn();
