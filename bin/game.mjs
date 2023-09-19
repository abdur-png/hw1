// game.mjs
import { generateDeck, shuffle, deal, draw } from './cards.mjs';
import { question } from 'readline-sync';
import clear from 'clear';
import { readFile } from 'fs';

const predefinedGameState = process.argv[2];
let gameState;
if (predefinedGameState) {
    readFile(predefinedGameState, 'utf8', (err, data) => {
        if (err) throw err;
        gameState = JSON.parse(data);
    });
}
else {
    const deck = shuffle(generateDeck());
    const [newDeck, playerHand] = deal(deck);
    const [finalDeck, computerHand] = deal(newDeck);
    
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
}
function displayGameState() {
    console.log("              CR🤪ZY 8's");
    console.log("-----------------------------------------------");
    console.log(`Next suit/rank to play: ➡️  ${gameState.nextPlay.rank}${gameState.nextPlay.suit}  ⬅️`);
    console.log("-----------------------------------------------");
    console.log(`Top of discard pile: ${gameState.discardPile[gameState.discardPile.length - 1].rank}${gameState.discardPile[gameState.discardPile.length - 1].suit}`);
    console.log(`Number of cards left in deck: ${gameState.deck.length}`);
    console.log("-----------------------------------------------");
    console.log(`🤖✋ (computer hand): ${gameState.computerHand.map(card => card.rank + card.suit).join('  ')}`);
    console.log(`😊✋ (player hand): ${gameState.playerHand.map(card => card.rank + card.suit).join('  ')}`);
    console.log("-----------------------------------------------");
}

// 4. Player's Turn
function playerTurn() {
    const playableCardIndex = gameState.playerHand.findIndex(card => 
        card.rank === gameState.nextPlay.rank || 
        card.suit === gameState.nextPlay.suit || 
        card.rank === '8'
    );

    if (playableCardIndex !== -1) {
        const playedCard = gameState.playerHand.splice(playableCardIndex, 1)[0];
        gameState.discardPile.push(playedCard);
        
        if (playedCard.rank === '8') {
            console.log("CRAZY EIGHTS! You played an 8 - choose a suit");
            console.log("1: ♠️\n2: ❤️\n3: ♣️\n4: ♦️");
            const choice = parseInt(question("> "));
            const suits = ["♠️", "❤️", "♣️", "♦️"];
            gameState.nextPlay = { rank: '8', suit: suits[choice - 1] };
        } else {
            gameState.nextPlay = playedCard;
        }
        
        console.log(`😊 Player's turn...`);
        console.log(`Card played: ${playedCard.rank}${playedCard.suit}`);
    } else {
        console.log(`😊 Player's turn...`);
        console.log(`😔 You have no playable cards`);
        // ... draw cards until a playable one is found or deck is empty
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
    } else {
        console.log(`🤖 Computer's turn...`);
        console.log(`😔 No playable cards`);
        // ... draw cards until a playable one is found or deck is empty
    }
}

displayGameState();
playerTurn();
computerTurn();
