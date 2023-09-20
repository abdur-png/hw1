// cards.mjs
const suits = {SPADES: '♠️', HEARTS: '❤️', CLUBS: '♣️', DIAMONDS: '♦️'};
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function range(...argc){
    let start, end, inc;
    switch (argc.length){
        case 1:
            [end] = argc;
            start = 0
            inc = 1
            break;
        case 2:
            [start, end] = argc;
            inc = 1;
            break;
        case 3:
            [start, end, inc] = argc;
            break;
        default:
            throw new Error("Invalid number of arguments provided to range function.");
    }

    const result = [];
    for (let i = start; i < end; i += inc) {
        result.push(i);
    }
    return result;

}
export function generateDeck(){
    return Object.values(suits).flatMap(suit => ranks.map(rank => ({ suit, rank })));
}

export function shuffle(deck){
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
    /*
    The shuffle algorithm used here is known as the Fisher-Yates (or Knuth) shuffle. 
    The basic idea is to iterate over the array from the last element to the first, 
    and for each element, swap it with a randomly chosen element that comes before it (or itself). 
    This ensures that each permutation of the array is equally likely.
    */
}
export function draw(cardsArray, n = 1) {
    return [cardsArray.slice(n), cardsArray.slice(0, n)];
}

export function deal(cardsArray, numHands = 2, cardsPerHand = 5) {
    const hands = [];
    for (let i = 0; i < numHands; i++) {
        const [newDeck, drawnCards] = draw(cardsArray, cardsPerHand);
        cardsArray = newDeck;
        hands.push(drawnCards);
    }
    return { deck: cardsArray, hands };
}

export function handToString(hand, sep = '  ', numbers = false){

    return hand.map((card, index) => `${numbers ? `${index + 1}: ` : ''}${card.rank}${card.suit}`).join(sep);
}
export function matchesAnyProperty(obj, matchObj) {
    // Iterate over the keys in matchObj
    for (let key in matchObj) {
        // Check if the key exists in obj and if the values match
        if (obj.hasOwnProperty(key) && obj[key] === matchObj[key]) {
            return true; // Return true if a match is found
        }
    }
    return false; // Return false if no matches are found
}

export function drawUntilPlayable(deck, matchObj) {
    const drawnCards = [];
    let found = false;

    // Start drawing from the end of the deck
    while (deck.length && !found) {
        const card = deck.pop();
        drawnCards.push(card); // Add the drawn card to the beginning of the drawnCards array

        // Check if the card matches the criteria
        if (card.rank === '8' || matchesAnyProperty(card, matchObj)) {
            found = true;
        }
    }

    // If no match is found, return the original deck in reverse order
    if (!found) {
        return [[], drawnCards.reverse()];
    }

    return [deck, drawnCards];
}


