module.exports = {
    createGame: require('./addGame').createGame,
    linkGameToUser: require('./linkGameToUser').linkGameToUser,
    queryGameByName: require('./queryGameByName').queryGameByName,
    scanAllGames: require('./scanAllGames').scanAllGames
};