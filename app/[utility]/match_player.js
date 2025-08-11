function match_player(queue) {
    if (queue.length < 2) {
        return false;
    }
    
    const player1 = queue.shift();
    const player2 = queue.shift();
    
    // Return the matched players
    return [player1, player2];
}

module.exports = match_player;