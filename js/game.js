/* globals Phaser */
Phaser.Plugin.KineticScrollingRemake = function(game, parent) {
  Phaser.Plugin.call(this, game, parent);
  this.dragging = false;
  this.timestamp = 0;
  this.callbackID = 0;

  this.targetX = 0;
  this.targetY = 0;

  this.autoScrollX = false;
  this.autoScrollY = false;

  this.startX = 0;
  this.startY = 0;

  this.velocityX = 0;
  this.velocityY = 0;

  this.amplitudeX = 0;
  this.amplitudeY = 0;

  this.directionWheel = 0;

  this.velocityWheelX = 0;
  this.velocityWheelY = 0;

  this.settings = {
    kineticMovement: true,
    timeConstantScroll: 325,
    horizontalScroll: true,
    verticalScroll: false,
    horizontalWheel: true,
    verticalWheel: false,
    deltaWheel: 40
  };
};
Phaser.Plugin.KineticScrollingRemake.prototype = Object.create(Phaser.Plugin.KineticScrolling.prototype);
Phaser.Plugin.KineticScrollingRemake.prototype.constructor = Phaser.Plugin.KineticScrollingRemake;

Phaser.Plugin.KineticScrolling.prototype.beginMove = function() {

  this.startX = this.game.input.x;
  this.startY = this.game.input.y;

  if (this.game.input.x < 60 || this.game.input.x > (this.game.width - 60) ||
    (this.game.input.y < this.game.height - sliderHeigth) || (this.game.input.y > this.game.height)) {
    this.dragging = false;
    this.autoScrollX = false;
  }
  this.dragging = true;

  this.timestamp = Date.now();

  this.velocityY = this.amplitudeY = this.velocityX = this.amplitudeX = 0;
};

Phaser.Plugin.KineticScrolling.prototype.moveCamera = function(pointer, x, y) {

  if (!this.dragging) return;

  this.now = Date.now();
  var elapsed = this.now - this.timestamp;
  this.timestamp = this.now;

  if (this.settings.horizontalScroll) {
    var delta = x - this.startX; //Compute move distance
    this.startX = x;
    this.velocityX = 0.8 * (1000 * delta / (1 + elapsed)) + 0.2 * this.velocityX;
    this.game.camera.x -= delta;
  }

  if (this.settings.verticalScroll) {
    var delta = y - this.startY; //Compute move distance
    this.startY = y;
    this.velocityY = 0.8 * (1000 * delta / (1 + elapsed)) + 0.2 * this.velocityY;
    this.game.camera.y -= delta;
  }

};

Phaser.Plugin.KineticScrolling.prototype.endMove = function() {

  this.dragging = false;
  this.autoScrollX = false;
  this.autoScrollY = false;

  if (!this.settings.kineticMovement) return;

  this.now = Date.now();

  if (this.velocityX > 10 || this.velocityX < -10) {
    this.amplitudeX = 0.8 * this.velocityX;
    this.targetX = Math.round(this.game.camera.x - this.amplitudeX);
    this.autoScrollX = true;
  }

  if (this.velocityY > 10 || this.velocityY < -10) {
    this.amplitudeY = 0.8 * this.velocityY;
    this.targetY = Math.round(this.game.camera.y - this.amplitudeY);
    this.autoScrollY = true;
  }
};


Phaser.Plugin.KineticScrolling.prototype.update = function() {

  this.elapsed = Date.now() - this.timestamp;

  if (this.autoScrollX && this.amplitudeX != 0) {
    flag = true;

    var delta = -this.amplitudeX * Math.exp(-this.elapsed / this.settings.timeConstantScroll);
    if (delta > 10 || delta < -10) {
      this.game.camera.x = this.targetX - delta;
    } else {
      flag = true;
      this.autoScrollX = false;
      this.game.camera.x = this.targetX;
    }
  }

  if (this.autoScrollY && this.amplitudeY != 0) {

    var delta = -this.amplitudeY * Math.exp(-this.elapsed / this.settings.timeConstantScroll);
    if (delta > 0.5 || delta < -0.5) {
      this.game.camera.y = this.targetY - delta;
    } else {
      this.autoScrollY = false;
      this.game.camera.y = this.targetY;
    }
  }

  if (this.settings.horizontalWheel && (this.velocityWheelX < -0.1 || this.velocityWheelX > 0.1)) {
    flag = false;

    this.autoScrollY = false;

    this.game.camera.x -= this.velocityWheelX;
    this.velocityWheelX *= 0.95;
  }

  if (this.settings.verticalWheel && (this.velocityWheelY < -0.1 || this.velocityWheelY > 0.1)) {

    this.game.camera.y -= this.velocityWheelY;
    this.velocityWheelY *= 0.95;
  }
};

var visibleItems = 4;
var rectangles = [];
var flag = true;
var sliderHeigth = 200;
var text;
var button;
var x = 32;
var y = 80;
var load = false;
var categoryQuontity = 11;
var bmpText;
var game = new Phaser.Game(768, 1024, Phaser.Auto, '', {
  preload: preload,
  create: create,
  update: update
});

game.preserveDrawingBuffer = true;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;


  this.game.load.image('loadScreen', '/assets/Loading.png');
  this.game.load.bitmapFont('dressFont', '/assets/font/dress-font.png', '/assets/font/dress-font.xml');
  this.game.KineticScrollingRemake = this.game.plugins.add(Phaser.Plugin.KineticScrollingRemake);
}


function create() {
  this.loadScreen = this.game.add.sprite(0, 0, 'loadScreen');

  //	You can listen for each of these events from Phaser.Loader
  this.game.load.onLoadStart.add(loadStart, this);
  this.game.load.onFileComplete.add(fileComplete, this);
  this.game.load.onLoadComplete.add(loadComplete, this);

  //	Progress report
  bmpText = this.game.add.bitmapText((this.game.width / 2) - 60, (this.game.height / 2) + 150, 'dressFont');
  bmpText.scale.set(3);
  bmpText.fixedToCamera = true;
  setTimeout(function() {
    start();
  }, 100);
}

function start() {
  this.game.load.atlasJSONHash('dressup', '/assets/dressup.png', '/assets/dressup.json');
  this.game.load.atlasJSONHash('DressuppThumb', '/assets/DressuppThumb.png', '/assets/DressuppThumb.json');
  this.game.load.audio('eventAudio', '/assets/audio/clickWater.wav');
  this.game.load.audio('bgAudio', '/assets/audio/bgMusic.mp3');
  this.game.load.audio('camera', '/assets/audio/camera.wav');
  this.game.load.image('backgroundP', '/assets/backgroundP.png');
  this.game.load.image('bgSlider', '/assets/bgSlider.png');

  this.game.KineticScrollingRemake = this.game.plugins.add(Phaser.Plugin.KineticScrollingRemake);
  this.game.load.start();
}

function loadStart() {
  bmpText.setText('Loading ...');
}

function fileComplete(progress) {
  bmpText.setText(progress + '%');
}

function loadComplete() {
  var items,
    initX = 0,
    initY = 70,
    atributesItem,
    category,
    eventSound,
    bgMusic,
    cameraSound;

  function scaleOuteCateg(target) {
    target.scale.set(0.8, 0.8);
    this.camera.x = 0;
  }

  function scaleOute() {
    this.reset.scale.set(0.8)
    this.takeScreenIcon.scale.set(0.8);
    this.rightArrow.scale.set(1, 1);
    this.leftArrow.scale.set(1, 1);
    this.game.add.tween(this.women).to({
      alpha: 1
    }, 500, 'Linear', true);
  }

  function left(item) {
    this.game.KineticScrollingRemake.configure({
      horizontalScroll: false,
      kineticMovement: false
    });
    eventSound.play();
    flag = false;
    var leftmove = (((646 / visibleItems) *
      Math.floor((this.game.camera.x / (646 / visibleItems))) + 1) + (646 / visibleItems));
    this.game.add.tween(this.camera).to({
      x: leftmove
    }, 500, Phaser.Easing.Linear.None, true);
    item.scale.set(1.2, 1.2);
    this.game.time.events.add(Phaser.Timer.SECOND * 0.2, scaleOute, this);
  }

  function right(item) {
    this.game.KineticScrollingRemake.configure({
      horizontalScroll: false,
      kineticMovement: false
    });
    eventSound.play();
    flag = false;
    var rightmove = (((646 / visibleItems) *
      Math.ceil((this.game.camera.x / (646 / visibleItems)))) - (646 / visibleItems));
    this.game.add.tween(this.camera).to({
      x: rightmove
    }, 500, Phaser.Easing.Linear.None, true);
    item.scale.set(1.2, 1.2);
    this.game.time.events.add(Phaser.Timer.SECOND * 0.2, scaleOute, this);
  }

  function resetGame() {
    eventSound.play();
    this.reset.scale.set(1.2, 1.2);
    this.game.add.tween(this.women).to({
      alpha: 0
    }, 500, 'Linear', true);

    this.women.removeAll();

    this.women.add(bodies);
    this.women.add(Hair);
    this.women.add(Eyebrows);
    this.women.add(Lips);
    this.women.add(Eyes);

    this.women.children[0].z = 0
    this.women.children[1].z = 100
    this.women.sort('y', Phaser.Group.SORT_ASCENDING)
    this.women.fixedToCamera = true;
  }

  function takeShot(target) {
    target.scale.set(0.8);
    if (this.group.children.length > 1) {
      cameraSound.play();
      this.takeScreenIcon.visible = false;
      this.reset.visible = false;
      this.group.visible = false;
      this.leftArrow.visible = false;
      this.rightArrow.visible = false;
      this.categoryGroupe.visible = false;
      this.bgSlider.visible = false;
      this.takeScreenIcon.scale.set(1.2, 1.2);
      setTimeout(snappp, 200, this);
    }
  }

  function snappp(thiss) {
    var bmd = this.game.add.bitmapData(this.game.width, this.game.height);
    bmd.copy(this.game.canvas, 0, 0, this.game.width, this.game.height, 0, 0, null, null, 0, 0, 0);
    bmd.canvas.toDataURL("image/jpeg", 1.0);
    var dataURL = bmd.canvas.toDataURL("image/jpeg", 1.0);
    window.open(dataURL, '_blank');
    // document.write("<img src='" + dataURL + "'>")
    thiss.group.visible = true;
    thiss.takeScreenIcon.visible = true;
    thiss.takeScreenIcon.scale.set(0.8);
    thiss.reset.visible = true;
    thiss.leftArrow.visible = true;
    thiss.rightArrow.visible = true;
    thiss.categoryGroupe.visible = true;
    thiss.bgSlider.visible = true;

  }

  this.game.KineticScrollingRemake.start();
  eventSound = game.add.audio('eventAudio');
  cameraSound = game.add.audio('camera');
  bgMusic = game.add.audio('bgAudio');
  bgMusic.restart = true;
  bgMusic.volume = 0.2;
  bgMusic.play();
  this.bgFon = this.game.add.sprite(0, 0, 'backgroundP');
  this.bgFon.fixedToCamera = true;
  this.women = this.add.group();
  this.bgSlider = this.game.add.sprite(15, 862, 'bgSlider');
  this.bgSlider.fixedToCamera = true;
  var bodies = this.game.add.sprite(0, 0, 'dressup', 'Bodies/1.png');
  var Hair = this.game.add.sprite(0, 0, 'dressup', 'Hair/1.png');
  var Lips = this.game.add.sprite(0, 0, 'dressup', 'Lips/1.png');
  var Eyes = this.game.add.sprite(0, 0, 'dressup', 'Eyes/1.png');
  var Eyebrows = this.game.add.sprite(0, 0, 'dressup', 'Eyebrows/12.png');

  this.women.add(bodies);
  this.women.add(Hair);
  this.women.add(Eyebrows);
  this.women.add(Lips);
  this.women.add(Eyes);

  this.women.children[1].z = 100
  this.women.sort('y', Phaser.Group.SORT_ASCENDING)
  this.women.fixedToCamera = true;

  this.group = this.add.group();
  this.group.create();
  this.group.x = 80;

  this.mask = this.game.add.graphics(0, 0);
  this.mask.beginFill(0x000000);
  this.mask.drawRect(62, this.game.height - 200, this.game.width - 122, 200);
  this.mask.alpha = 1;
  this.mask.fixedToCamera = true;
  this.group.mask = this.mask;

  this.takeScreenIcon = this.game.add.sprite(this.game.width - 70, 670, 'dressup', 'button/13.png');
  this.takeScreenIcon.fixedToCamera = true;
  this.takeScreenIcon.inputEnabled = true;
  this.takeScreenIcon.scale.set(0.8);
  this.takeScreenIcon.input.useHandCursor = true;
  this.takeScreenIcon.events.onInputDown.add(takeShot, this);
  this.takeScreenIcon.events.onInputUp.add(scaleOute, this);
  this.takeScreenIcon.anchor.set(0.5);

  this.reset = this.game.add.sprite(65, 570, 'dressup', 'button/12.png');
  this.reset.fixedToCamera = true;
  this.reset.inputEnabled = true;
  this.reset.scale.set(0.8);
  this.reset.input.useHandCursor = true;
  this.reset.events.onInputDown.add(resetGame, this);
  this.reset.events.onInputUp.add(scaleOute, this);
  this.reset.anchor.set(0.5);

  this.categoryGroupe = this.add.group();
  for (var i = 1; i < 7; i++) {
    category = this.game.add.sprite(this.game.width - 70, initY, 'dressup', 'button/' + i + '.png');
    category.anchor.set(0.5);
    category.inputEnabled = true;
    category.input.useHandCursor = true;
    category.scale.set(0.8);
    category.events.onInputDown.add(selectCategory, this);
    category.events.onInputUp.add(scaleOuteCateg, this);
    initY += 100;
    this.categoryGroupe.add(category);
    if (i === 6) {
      initY = 70;
    }
  }

  for (var i = 7; i < 12; i++) {
    category = this.game.add.sprite(65, initY, "dressup", 'button/' + i + '.png');
    category.anchor.set(0.5);
    category.inputEnabled = true;
    category.input.useHandCursor = true;
    category.scale.set(0.8);
    category.events.onInputDown.add(selectCategory, this);
    category.events.onInputUp.add(scaleOuteCateg, this);
    initY += 100;
    this.categoryGroupe.add(category);
  }

  for (var i = 1; i <= 7; i++) {
    atributesItem = this.game.add.sprite(initX, this.game.world.height - 85, 'DressuppThumb', 'Bodies/' + i + '.png');
    atributesItem.anchor.set(0, 0.5);
    atributesItem.inputEnabled = true;
    atributesItem.input.useHandCursor = true;
    atributesItem.scale.set(1);
    rectangles.push(atributesItem);
    initX += (this.game.width - 122) / visibleItems;
    atributesItem.events.onInputUp.add(selectItem, this);
    atributesItem.events.onInputDown.add(runKinetik, this);
    this.group.add(atributesItem);
    this.game.world.setBounds(0, 0, ((125 + 36.5) * (rectangles.length)) + 120, this.game.height);
  }

  this.leftArrow = this.game.add.sprite(50, 940, 'dressup', 'button/15.png');
  this.leftArrow.anchor.set(0.5);
  this.leftArrow.fixedToCamera = true;
  this.leftArrow.inputEnabled = true;
  this.leftArrow.input.useHandCursor = true;
  this.leftArrow.visible = true;

  this.rightArrow = this.game.add.sprite(this.game.width - 50, 940, 'dressup', 'button/14.png');
  this.rightArrow.anchor.set(0.5);
  this.rightArrow.fixedToCamera = true;
  this.rightArrow.inputEnabled = true;
  this.rightArrow.input.useHandCursor = true;
  this.rightArrow.visible = true;

  this.leftArrow.events.onInputDown.add(right, this);
  this.rightArrow.events.onInputDown.add(left, this);

  function selectCategory(target) {
    eventSound.play();
    this.game.KineticScrollingRemake.configure({
      horizontalScroll: false,
      kineticMovement: false
    });
    this.game.KineticScrollingRemake.targetX = 0
    this.camera.x = 0;
    target.scale.set(0.9, 0.9);
    this.game.add.tween(this.group).to({
      alpha: 1
    }, 100, 'Linear', true);
    this.group.removeAll();
    this.game.world.setBounds(0, 0, 0, this.game.height);
    initX = 0;
    rectangles = [];
    this.leftArrow.visible = true;
    this.rightArrow.visible = true;

    var quontity,
      atribute;
    switch (target.frameName) {
      case 'button/1.png':
        quontity = 5;
        atribute = 'Glasses/';
        break;
      case 'button/2.png':
        quontity = 18;
        atribute = 'Dresses/';
        break;
      case 'button/3.png':
        quontity = 45;
        atribute = 'Top/';
        break;
      case 'button/4.png':
        quontity = 40;
        atribute = 'Skirt/';
        break;
      case 'button/5.png':
        quontity = 10;
        atribute = 'Trousers/';
        break;
      case 'button/6.png':
        quontity = 3;
        atribute = 'Shoes/';
        break;
      case 'button/7.png':
        quontity = 65;
        atribute = 'Hair/';
        break;
      case 'button/8.png':
        quontity = 7;
        atribute = 'Bodies/';
        break;
      case 'button/9.png':
        quontity = 12;
        atribute = 'Eyebrows/';
        break;
      case 'button/10.png':
        quontity = 30;
        atribute = 'Eyes/';
        break;
      case 'button/11.png':
        quontity = 30;
        atribute = 'Lips/';
        break;
    }

    for (var i = 1; i <= quontity; i++) {
      atributesItem = this.game.add.sprite(initX, this.game.world.height - 85, 'DressuppThumb', atribute + i + '.png');
      atributesItem.anchor.set(0, 0.5);
      atributesItem.inputEnabled = true;
      atributesItem.input.useHandCursor = true;
      atributesItem.scale.set(1);
      rectangles.push(atributesItem);
      initX += (this.game.width - 122) / visibleItems;
      atributesItem.events.onInputUp.add(selectItem, this);
      atributesItem.events.onInputDown.add(runKinetik, this);
      this.group.add(atributesItem);
    }
    this.game.world.setBounds(0, 0, ((125 + 36.5) * (rectangles.length)) + 120, this.game.height);
  }

  this.categoryGroupe.fixedToCamera = true;

  this.game.KineticScrollingRemake.configure({
    kineticMovement: true,
    timeConstantScroll: 325,
    horizontalScroll: true,
    verticalScroll: false,
    horizontalWheel: true,
    verticalWheel: false,
    deltaWheel: 180
  });

  function selectItem(target) {
    var clothesItem;
    var checkItems = this.women.children.map(function(items) {
      return items.frameName.split('/')[0];
    });
    var checkItemsDelete = this.women.children.map(function(items) {
      return items.frameName;
    });
    var positionOfclothes = checkItems.indexOf(target.frameName.split('/')[0]);
    var positionOfclothesDelete = checkItemsDelete.indexOf(target.frameName);
    if (this.game.KineticScrollingRemake.amplitudeX === 0) {
      eventSound.play();
      if (positionOfclothesDelete === -1) {
        if (target.frameName.split('/')[0] === 'Bodies') {
          clothesItem = this.game.add.sprite(0, 0, 'dressup', target.frameName);
          this.women.remove(this.women.children[checkItems.indexOf('Bodies')]);
          checkItems.splice(checkItems.indexOf('Bodies'), 1)
          this.women.addChildAt(clothesItem, 0);
          this.women.children[0].z = -1;
          this.women.sort('y', Phaser.Group.SORT_ASCENDING)

        } else if (positionOfclothes > -1) {
          this.women.remove(this.women.children[positionOfclothes]);
          clothesItem = this.game.add.sprite(0, 0, 'dressup', target.frameName);
          if (target.frameName.split('/')[0] === 'Hair') {
            this.women.add(clothesItem);
            this.women.children[this.women.children.length - 1].z = 101;
            this.women.sort('y', Phaser.Group.SORT_ASCENDING)
          } else {
            this.women.add(clothesItem);
            this.women.children[this.women.children.length - 1].z = 1;
            this.women.sort('y', Phaser.Group.SORT_ASCENDING);
          }
        } else if (target.frameName.split('/')[0] === 'Dresses' &&
          (checkItems.indexOf('Top') > -1 ||
            checkItems.indexOf('Skirt') > -1 ||
            checkItems.indexOf('Trousers') > -1)) {
          this.women.remove(this.women.children[checkItems.indexOf('Top')]);
          checkItems.splice(checkItems.indexOf('Top'), 1)
          this.women.remove(this.women.children[(checkItems.indexOf('Skirt'))]);
          checkItems.splice(checkItems.indexOf('Skirt'), 1)
          this.women.remove(this.women.children[checkItems.indexOf('Trousers')]);
          checkItems.splice(checkItems.indexOf('Trousers'), 1)
          clothesItem = this.game.add.sprite(0, 0, 'dressup', target.frameName);
          this.women.add(clothesItem);
          this.women.children[this.women.children.length - 1].z = 1;
          this.women.sort('y', Phaser.Group.SORT_ASCENDING)
        } else if (target.frameName.split('/')[0] === 'Top' &&
          (checkItems.indexOf('Dresses') > -1)) {
          this.women.remove(this.women.children[checkItems.indexOf('Dresses')]);
          clothesItem = this.game.add.sprite(0, 0, 'dressup', target.frameName);
          this.women.add(clothesItem);
          this.women.children[this.women.children.length - 1].z = 1;
          this.women.sort('y', Phaser.Group.SORT_ASCENDING)
        } else if (target.frameName.split('/')[0] === 'Skirt' &&
          (checkItems.indexOf('Dresses') > -1 || checkItems.indexOf('Trousers') > -1)) {
          this.women.remove(this.women.children[checkItems.indexOf('Dresses')]);
          this.women.remove(this.women.children[checkItems.indexOf('Trousers')]);
          clothesItem = this.game.add.sprite(0, 0, 'dressup', target.frameName);
          this.women.add(clothesItem);
          this.women.children[this.women.children.length - 1].z = 1;
          this.women.sort('y', Phaser.Group.SORT_ASCENDING)
        } else if (target.frameName.split('/')[0] === 'Trousers' &&
          (checkItems.indexOf('Dresses') > -1 ||
            checkItems.indexOf('Skirt') > -1)) {
          this.women.remove(this.women.children[checkItems.indexOf('Dresses')]);
          this.women.remove(this.women.children[checkItems.indexOf('Skirt')]);
          clothesItem = this.game.add.sprite(0, 0, 'dressup', target.frameName);
          this.women.add(clothesItem);
          this.women.children[this.women.children.length - 1].z = 1;
          this.women.sort('y', Phaser.Group.SORT_ASCENDING)
        } else if (target.frameName.split('/')[0] === 'Hair') {
          clothesItem = this.game.add.sprite(0, 0, 'dressup', target.frameName);
          this.women.add(clothesItem);
          this.women.children[this.women.children.length - 1].z = 100;
          this.women.sort('y', Phaser.Group.SORT_ASCENDING)
        } else {
          clothesItem = this.game.add.sprite(0, 0, 'dressup', target.frameName);
          this.women.add(clothesItem);
          this.women.children[this.women.children.length - 1].z = 1;
          this.women.sort('y', Phaser.Group.SORT_ASCENDING)
        }
      }
    }
  }

  function runKinetik() {
    this.game.KineticScrollingRemake.configure({
      kineticMovement: true,
      horizontalScroll: true
    });
  }
}

function update() {
  var startMove = this.game.camera.x - this.game.KineticScrollingRemake.targetX;
  var curentItem;
  var move = rectangles.map(function(items) {
    return items.left;
  });
  for (var i = 0; i <= move.length; i++) {
    if (move[i] <= this.game.KineticScrollingRemake.targetX &&
      move[i + 1] >= this.game.KineticScrollingRemake.targetX &&
      (startMove > 10 || startMove < -10) && flag === true) {
      if (this.game.KineticScrollingRemake.targetX > move[i] &&
        this.game.KineticScrollingRemake.targetX < (move[i] + ((this.game.width - 122) / (visibleItems) / 2))) {
        curentItem = move[i];
        tweenPosition(curentItem);
      } else if (this.game.KineticScrollingRemake.targetX < move[i + 1] &&
        this.game.KineticScrollingRemake.targetX > (move[i] + ((this.game.width - 122) / (visibleItems) / 2))) {
        curentItem = move[i + 1];
        tweenPosition(curentItem);
      }
    } else if (flag === true) {
      this.game.KineticScrollingRemake.targetX += 0.1;
    }
  }
}

function tweenPosition(item) {
  this.game.KineticScrollingRemake.configure({
    kineticMovement: false,
    horizontalScroll: false
  });
  this.game.add.tween(this.game.camera).to({
    x: item
  }, 500, Phaser.Easing.Linear.None, true);
  flag = false;
}
