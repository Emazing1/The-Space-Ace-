var canvas, stage, exportRoot;
var score, inPlay, meteors = [], speed, bullets = [], lives = [];
var level, boss, bossPrize, enemiesLeft, bossLevel; 
var shield, time, power, powerMove, powerUp;
var background1, background2;
var highScore = 0; globalHighScore = 0;
var pause = false, pauseDelay = 0;

var hero;
const screenX = 1024;

function init() {
	canvas = document.getElementById("canvas");
	images = images||{};

	var loader = new createjs.LoadQueue(false);
	loader.addEventListener("fileload", handleFileLoad);
	loader.addEventListener("complete", handleComplete);
	loader.loadManifest(lib.properties.manifest);
}

function handleFileLoad(evt) {
	if (evt.item.type == "image") { images[evt.item.id] = evt.result; }
}

function handleComplete() {
	exportRoot = new lib.game();
	stage = new createjs.Stage(canvas);
	stage.addChild(exportRoot);
	stage.update();
	exportRoot.background.visible = false;
  background1 = new lib.background();
  background2 = new lib.background();
  exportRoot.addChildAt(background1,0);
  exportRoot.addChildAt(background2,0);
  background1.x = 0;
  background2.x = 1019;
  hero = exportRoot.hero;
  hero.rad = 38;
	createjs.Ticker.setFPS(lib.properties.fps);
	createjs.Ticker.addEventListener("tick", tick);
	endX = hero.x; 
  endY = hero.y; 
  stage.addEventListener("stagemousemove", moveHero);
  canvas.addEventListener("click", mouseDown);
  exportRoot.gameOver.addEventListener("click", playClicked);
  exportRoot.gameOver.visible = false; 
  exportRoot.bullet.visible = false;
  exportRoot.meteor1.visible = false;
  exportRoot.meteor2.visible = false;
  exportRoot.meteor3.visible = false;
  exportRoot.boss.visible = false;
  exportRoot.life.visible = false;
  exportRoot.totalHp.visible = false;
  exportRoot.currentHp.visible = false;
  exportRoot.pause.visible = false;
  resetGame();
  highScore = localStorage.getItem("highScore");
  exportRoot.highscore.text = highScore;
  inPlay = true;
}

function moveHero(evt)
{
  endX = evt.stageX;
  endY = evt.stageY;
}

function tick(event)
{ 
  if (inPlay)
  {
    if (pauseDelay <= 0)
    {
      if (key.isPressed("p"))
      {
        pauseDelay = 10;
        pause = !pause;
        if (pause)
        {
          exportRoot.pause.visible = true;
          canvas.removeEventListener("click", mouseDown);
        }
        else
        {
          exportRoot.pause.visible = false;
          canvas.addEventListener("click", mouseDown);
        }
      }
    }
    pauseDelay --;
    if(!pause)
    {
      hero.x -= (hero.x - endX)/6; 
      hero.y -= (hero.y - endY)/6; 
      score ++;
      var actualScore = Math.floor(score / 10);
      exportRoot.score.text = actualScore; 
      exportRoot.level.text = level;
      if (actualScore > highScore)
      {
        highScore = actualScore;
        exportRoot.highscore.text = highScore;
        localStorage.setItem("highScore", highScore);
      }
      if (!bossLevel)
      {
        addMeteors();
        moveMeteors();
        checkBulletsMeteors();
      }
      else
      {
        moveBoss();
        checkBossCollide();
      }
      moveBullets();
      powerUps();
      moveBackground(background2);
      moveBackground(background1);
      if (enemiesLeft < 1)
      {
        for (i=meteors.length-1; i>=0; i--)
        { 
          var meteor = meteors[i];
          exportRoot.removeChild(meteor);
        } 
        meteors = [];
        boss = new lib.boss();
        boss.hp = level * 10;
        boss.totalHp = level * 10;
        boss.x = 824;
        boss.y = 328;
        boss.rad = 80;
        boss.totalHpImage = new lib.totalHp();
        boss.currentHpImage = new lib.currentHp();
        exportRoot.addChild(boss.totalHpImage);
        exportRoot.addChild(boss.currentHpImage);
        bossPrize = 2000 + (200 * (level -1));
        var bossType = level % 5; 
        boss.gotoAndStop(bossType);
        exportRoot.addChild(boss);
        bossLevel= true;
        enemiesLeft = 20;
      }
    }
    stage.update(event);
  }
  else
  {
    exportRoot.gameOver.visible = true;
  }
  speed = Math.round(score/2000);
  stage.update(event); 
}

var moveBackground = function(background) {
      if (background.x < -1019) 
      {
        background.x = 1019;
        background.x -= 6;
      } 
      else 
      {
        background.x -=5;
      }
    }

function playClicked(e)
{
  inPlay = true;
  resetGame();
}

function gameOver(){ 
  inPlay=false; 
  for (i=0; i<meteors.length; i++)
  { 
    meteor = meteors[i]; 
    exportRoot.removeChild(meteor); 
  } 
  for (i=0; i<bullets.length; i++)
  { 
    bullet = bullets[i]; 
    exportRoot.removeChild(bullet); 
  } 
  exportRoot.gameOver.visible = true; 
  localStorage.setItem("highScore", highScore);
  canvas.removeEventListener("click", mouseDown);
}

function mouseDown(e) {
  if (bullets.length < 11)
  {
    var bullet = new lib.bullet;
    bullet.vel = 10; 
    bullet.x =  hero.x +60;
    bullet.y = hero.y +3;
    bullet.rad = 5;
    bullets.push(bullet);
    exportRoot.addChild(bullet); 
    stage.update(e);
  }
}
  

function resetGame()
{
  exportRoot.gameOver.visible = false; 
  canvas.addEventListener("click", mouseDown);
  score = 0;
  meteors = [];
  bullets = [];
  speed = 1;
  level = 1;
  bossPrize = 2000;
  enemiesLeft = 20;
  bossLevel = false;
  shield = false; 
  time = false; 
  powerMove = false; 
  powerUp = null; 
  power = exportRoot.power; 
  reset(power); 
  for (var i=0; i < 3; i++)
  {
    var life = new lib.life;
    lives.push(life);
    exportRoot.addChild(life);
    life.x += 114 + i*27;
    life.y = 21;
  }
}

function addMeteors()
{ 
  if (meteors.length < 10 || Math.random() < 0.01 && meteors.length < 25) 
  { 
    var meteor; 
    var type = Math.round(Math.random()*2)+1; 
    if (type == 1)
    { 
      meteor = getMeteor1(); 
    } 
    if (type == 2)
    { 
      meteor = getMeteor2();
    } 
    if (type == 3)
    { 
      meteor = getMeteor3();
    } 
    meteor.type = type;
    reset(meteor); 
    meteors.push(meteor); 
    exportRoot.addChild(meteor); 
  } 
}

function getMeteor1()
{
  var meteor = new lib.meteor1(); 
  meteor.setTransform(40,40); 
  meteor.vel = Math.round(Math.random()*2)+(1+speed); 
  meteor.rad = 35;
  return meteor; 
} 

function getMeteor2()
{
  var meteor = new lib.meteor2(); 
  meteor.setTransform(47,47); 
  meteor.vel = Math.round(Math.random()*4)+(3+speed); 
  meteor.rad = 40; 
  return meteor;
}

function getMeteor3()
{
  var meteor = new lib.meteor3(); 
  meteor.setTransform(9,9); 
  meteor.vel = Math.round(Math.random()*6)+(6+speed); 
  meteor.rad = 3;
  return meteor; 
}

function reset(met)
{ 
  met.y = Math.random()*(660+met.nominalBounds.height); 
  met.x = (Math.random()*300)+960; 
} 

function moveMeteors()
{ 
  for (var i=meteors.length-1; i>=0; i--) 
  { 
    meteor = meteors[i]; 
    if (time)
    {
      meteor.x -= (meteor.vel)/2; 
      meteor.rotation -= meteor.vel/4; 
    }
    else
    {
      meteor.x -= meteor.vel; 
      meteor.rotation -= meteor.vel/2; 
    }
    if (meteor.x < -100)
    { 
      remove(meteor,meteors);
    }
    if (checkCollide(hero,meteor) && !shield  )
    {
      if (lives.length > 0)
      {
          var life = lives.pop();
          exportRoot.removeChild(life);
          remove(meteor, meteors);
      }
      else
      {
        gameOver();
      }
    }
  }
} 

function moveBullets()
{ 
  for (var i=bullets.length-1; i>=0; i--) 
  { 
    bullet = bullets[i]; 
    bullet.x += bullet.vel; 
    if (bullet.x > 1100)
    {
      remove(bullet, bullets);
    }
  } 
}

function checkCollide(a, b)
{
  dx = b.x - a.x;
  dy = b.y - a.y;
  radii = a.rad + b.rad;
  return ( ( dx * dx )  + ( dy * dy ) <= radii * radii ) 
}

function checkBulletsMeteors()
{
  for (var i=bullets.length-1; i >= 0; i--)
  {
    bullet = bullets[i];
    for (var j=meteors.length-1; j >= 0; j--)
    {
      meteor = meteors[j];
      if (checkCollide(bullet,meteor))
      {
        if (meteor.type == 2 )
        {
          var newMeteor1 = getMeteor1();
          var newMeteor2 = getMeteor1();
          newMeteor1.type = 1;
          newMeteor2.type = 1;
          newMeteor1.y = meteor.y + 50;
          newMeteor2.y = meteor.y - 50;
          newMeteor1.x = meteor.x;
          newMeteor2.x = meteor.x;
          meteors.push(newMeteor1); 
          exportRoot.addChild(newMeteor1);
          meteors.push(newMeteor2); 
          exportRoot.addChild(newMeteor2);
          score += 30;  
        }
        if (meteor.type == 1)
        {
          score += 50;
        }
        else
        {
          score += 100;
        }
        remove(meteor,meteors);
        remove(bullet,bullets);
        enemiesLeft --;
      }
    }
  }
}

function remove(item, items)
{
   var index = items.indexOf(item);
   items.splice(index, 1);
   exportRoot.removeChild(item);
}

function powerUps()
{ 
  if(Math.random() < 0.1 && powerMove==false && time == false && shield == false )
  { 
    powerMove=true; 
    powerUp = Math.round(Math.random()*2); 
    power.gotoAndStop(powerUp); 
    power.rad = 15;
  } 
  if(powerMove)
  { 
    power.x -= 10; 
    power.rotation -= 5; 
    if (power.x < -100)
    { 
      reset(power); 
      powerMove = false; 
    } 
    if (checkCollide(hero, power))
    {
      powerMove = false;
      switch (powerUp)
      {
        case 0:
          score += 200;
          break;
        case 1:
          setTimeout(slowTime,15000); 
          time = true;
          break;
        case 2:        
          setTimeout(shieldTime,15000); 
          shield = true; 
          exportRoot.hero.gotoAndPlay("shield"); 
          break;
      }
      reset(power);
    }
  } 
} 

function slowTime()
{ 
  time=false; 
} 
function shieldTime()
{ 
  shield=false; 
  exportRoot.hero.gotoAndPlay("fly"); 
} 

function checkBossCollide()
{
  for (var i=bullets.length-1; i >= 0; i--)
  {
    bullet = bullets[i];
    if (checkCollide(bullet, boss))
    {
      boss.hp --;
      //(boss.totalHpImage.nominalBounds.width) *
      var hp =  -(boss.hp / boss.totalHp);
      console.log(hp);
      boss.currentHpImage.scaleX = hp;
      remove(bullet,bullets);
      if (boss.hp < 1)
      {
        exportRoot.removeChild(boss);
        exportRoot.removeChild(boss.totalHpImage);
        exportRoot.removeChild(boss.currentHpImage);
        score += bossPrize;
        level ++;
        enemiesLeft = 15*level;
        bossLevel = false;
        bossx *= 1.4;
        bossy *= 1.2;
        
      }
    }
  }
  if (checkCollide(hero,boss) && !shield  )
  {
    if (lives.length > 0)
    {
        var life = lives.pop();
        exportRoot.removeChild(life);
        boss.hp --;
    }
    else
    {
      exportRoot.removeChild(boss);
      exportRoot.removeChild(boss.totalHpImage);
      exportRoot.removeChild(boss.currentHpImage);
      gameOver();
    }
  }
}

var bossx = 10;
var bossy = 3;
function moveBoss()
{
  boss.x -= bossx;
  boss.y -= bossy;
  boss.rotation -= bossx;
  if (boss.x < 100 || boss.x > 900)
  {
    bossx = -bossx;
  }
  if (boss.y > 700 || boss.y < 100)
  {
    bossy = -bossy;
  }
  boss.totalHpImage.x = boss.x;
  boss.totalHpImage.y = boss.y - 100;
  boss.currentHpImage.x = boss.x;
  boss.currentHpImage.y = boss.y - 100;
}

