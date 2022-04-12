class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");
    this.leaderTitle = createElement("h2");
    this.leaderOne = createElement("h2");
    this.leaderTwo = createElement("h2");
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }

  update(state) {
    database.ref("/").update({
      gameState: state
    })
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width/2 - 50, height - 100);
    car1.addImage(car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width/2 + 100, height - 100);
    car2.addImage(car2_img);
    car2.scale = 0.07;
    
    cars = [car1, car2];

    fuels = new Group();
    obstacles = new Group();
    coins = new Group();

    var obstaclesPositions = [
      {x: width/2 + 250, y: height - 800, image: obsOneImg},
      {x: width/2 - 150, y: height - 1300, image: obsTwoImg},
      {x: width/2 + 250, y: height - 1800, image: obsOneImg},
      {x: width/2 - 180, y: height - 2300, image: obsTwoImg},
      {x: width/2, y: height - 2800, image: obsOneImg},
      {x: width/2 - 180, y: height - 3300, image: obsTwoImg},
      {x: width/2 + 180, y: height - 3300, image: obsOneImg},
      {x: width/2 + 250, y: height - 3800, image: obsTwoImg},
      {x: width/2 - 150, y: height - 4300, image: obsOneImg},
      {x: width/2 + 250, y: height - 5300, image: obsTwoImg},
      {x: width/2 + 180, y: height - 5500, image: obsOneImg}
    ];

    this.addSprites(fuels, 4, fuelImg, 0.02);
    this.addSprites(coins, 18, coinImg, 0.09);
    this.addSprites(obstacles, obstaclesPositions.length, obsOneImg, 0.04, obstaclesPositions);
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    for (var v = 0; v < numberOfSprites; v++) {
      var x, y;
      
      if (positions.length > 0) {
        x = positions[v].x;
        y = positions[v].y
        spriteImage = positions[v].image;
      }

      else {
        x = random(width/2 + 150, width/2 - 150);
        y = random(-height * 4.5, height - 400);
      }

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage)
      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("reset game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width/2 + 200, 40);
    
    this.resetButton.class("resetButton");
    this.resetButton.position(width/2 + 230, 40);

    this.leaderTitle.html("leaderboard");
    this.leaderTitle.class("resetText");
    this.leaderTitle.position(width/3 - 60, 40);

    this.leaderOne.class("leaderText");
    this.leaderOne.position(width/3 - 50, 80);

    this.leaderTwo.class("leaderText");
    this.leaderTwo.position(width/3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo();

    if (allPlayers != undefined) {
      image (track, 0, -height * 5, width, height * 6);
      var index = 0;
      this.showLeaderboard();
      for (var plr in allPlayers) {
        index = index + 1;
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;
        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(9);
          strokeStyle("blue");
          fill("black");
          ellipse(x, y, 60, 60);
          this.handleFuel(index);
          this.handleCoins(index);
          camera.position.x = cars[index - 1].position.x;
          camera.position.y = cars[index - 1].position.y;
        }
      }
      this.handlePlayerControls();
      drawSprites();
    }
  }
  
  handlePlayerControls() {
    if (keyIsDown(UP_ARROW)) {
      player.positionY += 8;
      player.update();
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > width/3 - 50) {
      player.positionX -= 8;
      player.update();
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width/2 + 300) {
      player.positionX += 8;
      player.update();
    }
  }

  showLeaderboard() {
    var leaderOne;
    var leaderTwo;
    var players = Object.values(allPlayers);

    if ((players[0].rank === 0 && players[1].rank === 0) || players[0].rank === 1) {
      leaderOne = players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score + "&emsp;";
      leaderTwo = players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score + "&emsp;";
    }

    if (players[1].rank === 1) {
      leaderOne = players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score + "&emsp;";
      leaderTwo = players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score + "&emsp;";
    }

    this.leaderOne.html(leaderOne);
    this.leaderTwo.html(leaderTwo);
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0, 
        gameState: 0,
        players: {}
      })
      window.location.reload();
    })
  }

  handleFuel(index) {
    cars[index - 1].overlap(fuels, function(collector, collected){
      player.fuel = 185;
      collected.remove();
    })
  }

  handleCoins(index) {
    cars[index - 1].overlap(coins, function(collector, collected){
      player.score += 20;
      player.update();
      collected.remove();
    })
  }

}
