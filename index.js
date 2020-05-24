var game = new Game();
var gameEngine = new GameEngine();
var imageManager = new ImageManager();
var soundManager = new SoundManager();
gameEngine.init(game, imageManager, soundManager, 60);

soundManager.registerSound({name:'failedSound', src:'sounds/failedSound.mp3'}, 1);
soundManager.registerSound({name:'whip-sound', src:'sounds/whip-sound.wav'}, 0.1, 1);
soundManager.registerSound({name:'boss-hit', src:'sounds/hit.wav'}, 0.3, 1);
soundManager.registerSound({name:'mainball-hit', src:'sounds/punch.mp3'}, 1, 1);
soundManager.registerSound({name:'lb-sfx', src:'sounds/lb-sfx.wav'}, 0.2, 1);
soundManager.registerSound({name:'boss-battle-bgm', src:'sounds/boss-battle-bgm.mp3'}, 0.05, 1);

var loadPromises = [
	imageManager.registerImage({name:'flightImage', path: 'image/', src:'flightIcon.png'}),
	imageManager.registerImage({name:'bossImage', path:'image/', src: 'pumpkin.png'})
];

Promise.all(loadPromises).then(gameEngine.start());

