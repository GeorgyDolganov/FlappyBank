//Сокращения
const Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    res = PIXI.Loader.shared.resources,
    Sprite = PIXI.Sprite,
    Container = PIXI.Container,
    TextStyle = PIXI.TextStyle,
    Text = PIXI.Text,
    collison = new Bump(PIXI),
    randomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
//Слушатель клавиатуры
const keyboard = (value) => {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    key.downHandler = event => {
      if (event.key === key.value) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
      }
    };
  
    key.upHandler = event => {
      if (event.key === key.value) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };
  
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener(
      "keydown", downListener, false
    );
    window.addEventListener(
      "keyup", upListener, false
    );
    
    key.unsubscribe = () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
    
    return key;
}

//Праметры
let screenWidth = 1280,
    screenHeight = 800,
    tileScale = 0.05,
    playerScale = 0.007,
    enemyScale = 0.015,
    enemySpacing = 50,
    enemyOffsetX = 75,
    enemySpeed = 2,
    enemyDirection = 1,
    coinScale = 0.05,
    coinSpacing = 2.5,
    coinOffsetX = 1,
    tileOffset = 510 * tileScale,
    backgroundSize = 0.7,
    keyLeft = keyboard("ArrowLeft"),
    keyUp = keyboard("ArrowUp"),
    keyRight = keyboard("ArrowRight"),
    keyDown = keyboard("ArrowDown");
    keyR = keyboard("r");
    keyRrus = keyboard("к");

//Функция контейнера
function contain(sprite, container) {

    let collision = undefined;
    if (sprite.x < container.x) {
      sprite.x = container.x;
      collision = "left";
    }
  
    if (sprite.y < container.y) {
      sprite.y = container.y;
      collision = "top";
    }
  
    if (sprite.x + sprite.width > container.width) {
      sprite.x = container.width - sprite.width;
      collision = "right";
    }
  
    if (sprite.y + sprite.height > container.height) {
      sprite.y = container.height - sprite.height;
      collision = "bottom";
    }
  
    return collision;
}

//Генератор платформ
const createPlatform = (x, y, width) => {
    let platform = new Container();
    platform.x = x;
    platform.y = y;
    if (width > 2) {
        let grassCliffLeft = new Sprite(tileSheet.textures["GrassCliffLeft.png"]);
        grassCliffLeft.scale.x = tileScale;
        grassCliffLeft.scale.y = tileScale;
        platform.addChild(grassCliffLeft);
        let counter = 1;
        let midBlockArray = [];
        for (let i = width; i >= 2; i--) {
            midBlockArray[i] = new Sprite(tileSheet.textures["GrassCliffMid.png"]);
            midBlockArray[i].x = tileOffset * counter;
            counter ++;
            midBlockArray[i].scale.x = tileScale;
            midBlockArray[i].scale.y = tileScale;
            platform.addChild(midBlockArray[i]);
        }
        let grassCliffRight = new Sprite(tileSheet.textures["GrassCliffRight.png"]);
        grassCliffRight.x = tileOffset * width;
        grassCliffRight.scale.x = tileScale;
        grassCliffRight.scale.y = tileScale;
        platform.addChild(grassCliffRight);
    }
    else if (width == 2) {
        let grassCliffLeft = new Sprite(tileSheet.textures["GrassCliffLeft.png"]);
        grassCliffLeft.scale.x = tileScale;
        grassCliffLeft.scale.y = tileScale;
        platform.addChild(grassCliffLeft);
        let grassCliffRight = new Sprite(tileSheet.textures["GrassCliffRight.png"]);
        grassCliffRight.x = tileOffset;
        grassCliffRight.scale.x = tileScale;
        grassCliffRight.scale.y = tileScale;
        platform.addChild(grassCliffRight);
    }
    else if (width == 1) {
        let grassBlock = new Sprite(tileSheet.textures["GrassBlock.png"]);
        grassBlock.scale.x = tileScale;
        grassBlock.scale.y = tileScale;
        platform.addChild(grassBlock);
    }
    else { 
        alert("Неверное значение. width = " + width);
    }
    return platform;
};

//Генератор рандомных противников
const generateEnemies = (enemyCount) => {

    let enemiesContainer = new Container();


    for (let i = 0; i < enemyCount; i++) {
        let mace = new Sprite(res["assets/sheets/enemies/mace.png"].texture);
        let x = enemySpacing * i + enemyOffsetX;
        mace.scale.x = enemyScale;
        mace.scale.y = enemyScale;
        let y = randomInt(0, app.stage.height - mace.height);
        mace.x = x;
        mace.y = y;

        mace.vy = enemySpeed * enemyDirection;

        enemyDirection *= -1;

        enemiesContainer.addChild(mace);
    }

    return enemiesContainer;
}

//Генератор рандомных монеток
const generateCoins = (coinCount) => {

    let coinContainer = new Container();


    for (let i = 0; i < coinCount; i++) {
        let coin = new Sprite(res["assets/sheets/coin/Coin.png"].texture);
        let x = coinSpacing * i + coinOffsetX;
        coin.scale.x = coinScale;
        coin.scale.y = coinScale;
        let y = randomInt(0, app.stage.height - coin.height);
        coin.x = x;
        coin.y = y;

        coinContainer.addChild(coin);
    }

    return coinContainer;
}

//Генератор уровня #1
const generateLevel1 = () => {

    level1 = new Container();

    platform1 = createPlatform(1, 26 * 5, 10); 
    level1.addChild(platform1);

    platform2 = createPlatform(26 * 3, 26 * 2, 2); 
    level1.addChild(platform2);

    platform3 = createPlatform(26 * 12, 26 * 10, 18); 
    level1.addChild(platform3);

    platform4 = createPlatform(26 * 5, 26 * 10, 2);
    level1.addChild(platform4);

    platform5 = createPlatform(26 * 5, 26 * 16, 5); 
    level1.addChild(platform5);

    platform6 = createPlatform(26 * 5, 26 * 25, 18); 
    level1.addChild(platform6);

    platform7 = createPlatform(26 * 2, 26 * 20, 2);
    level1.addChild(platform7);

    platform8 = createPlatform(26 * 28, 26 * 20, 2);
    level1.addChild(platform8);

    platform9 = createPlatform(26 * 30, 26 * 9, 2);
    level1.addChild(platform9);

    platform10 = createPlatform(26 * 32, 26 * 8, 2);
    level1.addChild(platform10);

    platform11 = createPlatform(26 * 34, 26 * 7, 2);
    level1.addChild(platform11);

    platform12 = createPlatform(26 * 36, 26 * 6, 2);
    level1.addChild(platform12);

    platform13 = createPlatform(26 * 38, 26 * 5, 10);
    level1.addChild(platform13);

    platform14 = createPlatform(26 * 35, 26 * 15, 5);
    level1.addChild(platform14);

    platform15 = createPlatform(26 * 45, 26 * 12, 3);
    level1.addChild(platform15);

    level1Coins = generateCoins(550);
    level1Enemies = generateEnemies(24);

    exitDoor = new Sprite(res['assets/sheets/door/door.png'].texture);
    exitDoor.scale.x = tileScale * 1.5;
    exitDoor.scale.y = tileScale * 1.5;
    exitDoor.x = 26 * 46;
    exitDoor.y = 26 * 10.56;

    gameScene.addChild(exitDoor);
    gameScene.addChild(level1);
    gameScene.addChild(level1Coins);
    gameScene.addChild(level1Enemies);
    
    
    console.log("Уровень #1 загружен");
}

const app = new Application({
    width: screenWidth, 
    height: screenHeight, 
});

//Добавляем канвас и устанавливаем цвет
document.body.appendChild(app.view);
app.renderer.backgroundColor = 0x3772FF;


loader
    .add([
        'assets/img/background.png',
        'assets/sheets/player/body.png',
        'assets/sheets/enemies/mace.png',
        'assets/sheets/coin/Coin.png',
        'assets/sheets/door/door.png',
        'assets/sheets/tiles/grassTiles.json',

    ])
    .on("progress", loadProgressHandler)
    .load(setup);

function loadProgressHandler(loader, resource) {
    console.log("Загрузка: " + resource.url); 

    console.log("Прогресс: " + loader.progress + "%"); 
}

let state, onGround;

let score = 0;

function setup() {
    console.log("Установка");

    gameScene = new Container();
    app.stage.addChild(gameScene);
    gameScene.filters = [new PIXI.filters.AdvancedBloomFilter(0.95), new PIXI.filters.GodrayFilter, new PIXI.filters.PixelateFilter(1.8), new PIXI.filters.RGBSplitFilter([-2,0],[0,2],[-1,0]),];
    gameOverScene = new Container();
    app.stage.addChild(gameOverScene);
    gameOverScene.visible = false;

    background = new Sprite(res["assets/img/background.png"].texture);
    background.scale.x = backgroundSize;
    background.scale.y = backgroundSize;
    gameScene.addChild(background);

    tileSheet = res["assets/sheets/tiles/grassTiles.json"].spritesheet;
    
    generateLevel1();

    let style = new TextStyle({
        fontFamily: "Open Sans",
        fontSize: 54,
        fontWeight: "bold",
        fill: "#080708"
      });
    message = new Text("Ты выйграл!", style);
    message.x = 0;
    message.y = 120;
    gameOverScene.addChild(message);

    finalScore = new Text("Всего очков: " + score);
    finalScore.x = 0;
    finalScore.y = 200;
    gameOverScene.addChild(finalScore);

    let highscoreStyle = new TextStyle({
        fontFamily: "Open Sans",
        fontSize: 32,
        fontWeight: "bold",
        fill: "#080708"
    });
    highscore = new Text("Твой лучший результат: " + localStorage.getItem('highscore'), highscoreStyle);
    highscore.x = 0;
    highscore.y = 300;
    gameOverScene.addChild(highscore);
      
    let hintStyle = new TextStyle({
        fontFamily: "Open Sans",
        fontSize: 18,
        fontWeight: "bold",
        fill: "#080708"
    });
    restartHint = new Text("*F5 чтобы начать заново", hintStyle);
    restartHint.x = 1000;
    restartHint.y = 750;
    gameOverScene.addChild(restartHint);


    player = new Sprite(res["assets/sheets/player/body.png"].texture);
    player.anchor.x = 0.5;
    player.scale.x = playerScale;
    player.scale.y = playerScale;
    player.y = 1;
    player.x = 1;
    player.vx = 0;
    player.vx = 0;
    gameScene.addChild(player);

    let styleScore = new TextStyle({
        fontFamily: "Open Sans",
        fontSize: 42,
        fontWeight: "bold",
        fill: "#080708"
      });
    scoreText = new Text("Очки: " + score, styleScore);
    scoreText.x = 1020;
    scoreText.y = 700;
    gameScene.addChild(scoreText);
    

    console.log("Установка завершена успешно");

    keyLeft.press = () => {
        player.vx = -2;
        player.scale.x = -playerScale;
    };

    keyLeft.release = () => {
        if (!keyRight.isDown) {
            player.vx = 0;
        }
    };

    keyUp.press = () => {
        player.vy = -3  ;
    };

    keyUp.release = () => {
        if (!keyDown.isDown) {
            player.vy = 0;
        }
    };
    
    keyRight.press = () => {
        player.vx = 2;
        player.scale.x = playerScale;
    };

    keyRight.release = () => {
        if (!keyLeft.isDown) {
            player.vx = 0;
        }
    };

    keyDown.press = () => {
        player.vy = 1;
    };

    keyDown.release = () => {
        if (!keyUp.isDown) {
            player.vy = 0;
        }
    };

    keyR.press = () => {
        player.x = 15;
        player.y = 40;
        console.log("Рестарт")
    };

    keyRrus.press = () => {
        player.x = 15;
        player.y = 40;
        console.log("Рестарт")
    };

    state = play; 
    
    app.ticker.add(delta => gameLoop(delta));
};

function gameLoop(delta){

    state(delta);

};

function play(delta){

    player.vy += 0.1;
    player.x += player.vx;
    player.y += player.vy;
    level1Enemies.children.forEach((mace) => {
        mace.y += mace.vy;

        let maceHitsWall = contain(mace, {x: 0, y: 0, width: 1280, height: 800});

        if (maceHitsWall === "top" || maceHitsWall === "bottom") {
            mace.vy *= -1;
        }
    })

    collison.hit(player, level1.children, true, false, false, () => {
        player.vy = 0;
    });
    collison.hit(player, level1Enemies.children, true, false, false, () => {
        document.location.reload(true);
    });
    collison.hit(player, level1Coins.children, true, false, false, (side, item) => {
        item.destroy();
        score ++;
        scoreText.text = "Очки: "+ score;
    });
    
    collison.hit(player, exitDoor, true, false, false, (side, item) => {
        state = end;
    });
    

};

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
    finalScore.text = "Всего очков: "+ score;
    if ( localStorage.getItem('highscore') == null || score >    localStorage.getItem('highscore')){
        localStorage.setItem('highscore', score);
        highscore.text = "Твой лучший результат: "+ score;
    };
    
};
