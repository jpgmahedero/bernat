
         
          var primer = ['abdullah.png',
'abraham.png',
'ahmed.png',
'ayoub.png',
'bilawal.png',
'camino.png',
'cristina.png',
'cristobal.png',
'danileon.png',
'eguizabal.png',
'frandy.png',
'isaac.png',
'ismael.png',
'ivanayora.png',
'jonathan2.png',
'jordi.png',
'joseluis.png',
'josue.png',
'leslie.png',
'mahamadou.png',
'mahtab.png',
'mendoza.png',
'moha.png',
'ricard.png',
'seydou.png',
'shamas.png',
'sufian.png',
'taimoor.png',
'umar.png',
'xinsen.png',
'ahsan.png',
'albert.png',
'alex.png',
'alfonso.png',
'alikhalid.png',
'andres.png',
'angel.png',
'ashimu.png',
'chaimae.png',
'danielarias.png',
'david.png',
'dcordoba.png',
'dfuentes.png',
'dgazquez.png',
'dilawar.png',
'edgar.png',
'erwin.png',
'gianluca.png',
'igot.png',
'ivanayora.png',
'jantonio.png',
'javi.png',
'jesus.png',
'jonathan.png',
'juanheredia.png',
'kevin.png',
'marccabrera.png',
'marcgarrido.png',
'naveed.png',
'noelia.png',
'omenacho.png',
'sergi.png',
'usman.png',
'yeray.png',
'yoandy.png'

                    ];

var urlParams = {};
(function () {
  var match,
    pl     = /\+/g,  // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
    query  = window.location.search.substring(1);

  while (match = search.exec(query)) {
    urlParams[decode(match[1])] = decode(match[2]);
  }
})();


var b2d = {
  b2Vec2 : Box2D.Common.Math.b2Vec2,
  b2BodyDef : Box2D.Dynamics.b2BodyDef,
  b2Body : Box2D.Dynamics.b2Body,
  b2FixtureDef : Box2D.Dynamics.b2FixtureDef,
  b2Fixture : Box2D.Dynamics.b2Fixture,
  b2World : Box2D.Dynamics.b2World,
  b2MassData : Box2D.Collision.Shapes.b2MassData,
  b2PolygonShape : Box2D.Collision.Shapes.b2PolygonShape,
  b2CircleShape : Box2D.Collision.Shapes.b2CircleShape,
  b2DebugDraw : Box2D.Dynamics.b2DebugDraw
};

var WORLD_SCALE = 32;
var SCALE = (urlParams.scale && !isNaN(urlParams.scale)) ? Math.min(2, Math.max(0.35, Number(urlParams.scale))) : 0.7;
var DEBUG = "debug" in urlParams;
var FADE = (urlParams.fade && !isNaN(urlParams.fade)) ? Math.min(1, Math.max(0, Number(urlParams.fade))) : 0.6;
FADE=1;
var canvas, stage, ballDefs, spriteSheet, ballDelay, w, h, ballsToRemove, count, world;
var c = createjs;

function init() {
  stage = new createjs.Stage("canvas");
  
  w = stage.canvas.width;
  h = stage.canvas.height;
  ballsToRemove = [];
  count = 0;
  
  stage.addChild(new c.Shape()).set({alpha:FADE}).graphics.beginFill("#47B").drawRect(0,0,w,h);
  
  // set up defs:
  var builder = new c.SpriteSheetBuilder();
  var mc = new lib.Balls();
  mc.actionsEnabled = false;
  mc.circle.visible = false;
  builder.addMovieClip(mc, null, SCALE);
  spriteSheet = builder.build();
  
  ballDefs = [];
  for (var i=0, l=spriteSheet.getNumFrames(); i<l; i++) {
    mc.gotoAndStop(i);
    ballDefs.push({frame:i, radius:mc.circle.scaleX*100*SCALE/2});
  }
  
  setupPhysics();

  c.Sound.registerSound("assets/explosion.mp3", "splort");

  c.Ticker.setFPS(30);
  c.Ticker.addEventListener("tick", tick.bind(this));
  c.Ticker.useRAF = true;
  c.Touch.enable(stage);
}

function setupPhysics() {
  world = new b2d.b2World(new b2d.b2Vec2(0, 20), true);
  
  // ground
  var fixDef = new b2d.b2FixtureDef();
  fixDef.density = 1;
  fixDef.friction = 0.5;
  fixDef.restitution = 0;
  fixDef.shape = new b2d.b2PolygonShape();
  fixDef.shape.SetAsBox(w/WORLD_SCALE*0.6, 10/WORLD_SCALE);
  
  var bodyDef = new b2d.b2BodyDef();
  bodyDef.type = b2d.b2Body.b2_staticBody;
  bodyDef.position.x = w/2/WORLD_SCALE;
  bodyDef.position.y = (h+10)/WORLD_SCALE;
  
  world.CreateBody(bodyDef).CreateFixture(fixDef);
  
  // debug draw:
  var debugDraw = new b2d.b2DebugDraw();
  debugDraw.SetSprite(stage.canvas.getContext("2d"));
  debugDraw.SetDrawScale(WORLD_SCALE);
  debugDraw.SetFlags(b2d.b2DebugDraw.e_shapeBit | b2d.b2DebugDraw.e_jointBit);
  world.SetDebugDraw(debugDraw);
}

function addBall(type, scale) {
  scale = scale || 1;
  var def = ballDefs[Math.random()*2+type*2|0];
  var radius = def.radius*SCALE*scale;
  
  // physics:
  var fixDef = new b2d.b2FixtureDef();
  fixDef.density = 0.1;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.6;
  fixDef.shape = new b2d.b2CircleShape(def.radius/WORLD_SCALE);
  
  var bodyDef = new b2d.b2BodyDef();
  bodyDef.type = b2d.b2Body.b2_dynamicBody;
  
  var body = world.CreateBody(bodyDef);
  body.CreateFixture(fixDef);
  
  var sprite = new c.BitmapAnimation(spriteSheet);
  sprite.gotoAndStop(def.frame);
  sprite.scaleX = sprite.scaleY = scale;
  if (type == 0) { sprite.addEventListener("mousedown", boom.bind(this)); }
  stage.addChild(sprite);
  
  var ball = {def:def, fixDef:fixDef, bodyDef:bodyDef, body:body, sprite:sprite, radius:radius, type:type};
  body.userData = sprite.userData = ball;
  
  return ball;
}

function resetBall(ball) {
  var body = ball.body;
  if (ball.type == 0) {
    body.SetPositionAndAngle(new b2d.b2Vec2(Math.random()*w/WORLD_SCALE|0, -(ball.radius*2+100*SCALE)/WORLD_SCALE), 0);
    body.SetLinearVelocity(new b2d.b2Vec2(Math.random()*20-10),0);
    body.SetAngularVelocity(0);
  }
}

function removeBall(ball) {
  ballsToRemove.push(ball);
}

function removeBalls() {
  while (ballsToRemove.length) {
    var ball = ballsToRemove.pop();
    world.DestroyBody(ball.body);
    stage.removeChild(ball.sprite);
    ball.body = null;
  }
}

function tick(evt) {
  world.Step(evt.delta/1000, 10, 10);
  if (DEBUG) { world.DrawDebugData(); }
  
  if (count++ % 2 == 0 && world.GetBodyCount() < w*h/(125*125)/(SCALE*SCALE)) { // 125*125 == average unscaled area of a ball
    resetBall(addBall(0));
  }
  
  for (var body = world.GetBodyList(); body; body = body.GetNext()) {
    var ball = body.userData;
    if (!ball) { continue; }
    var pt = body.GetPosition();
    var sprite = ball.sprite;
    sprite.x = pt.x*WORLD_SCALE;
    sprite.y = pt.y*WORLD_SCALE;
    sprite.rotation = body.GetAngle()/Math.PI*180;
    if (ball.type != 0) { sprite.alpha -= 0.03; }
    if (sprite.y > h || sprite.x < -ball.radius*1.5 || sprite.x > w+ball.radius*1.5 || sprite.alpha <= 0) {
      if (ball.type == 0) { resetBall(ball); }
      else { removeBall(ball); }
    }
  }

  removeBalls();
  
  stage.autoClear = false;
  stage.alpha = 1-DEBUG*0.5;
  stage.update();
}

function boom(evt) {
  c.Sound.play("splort");

  var ball = evt.target.userData;
  resetBall(ball);
  var maxD = (50+SCALE*400)/WORLD_SCALE;
  var maxF = SCALE*SCALE*120;
  var x = evt.stageX/WORLD_SCALE;
  var y = evt.stageY/WORLD_SCALE;

  var ball = evt.target.userData;
  var frame = ball.def.frame;
  for (var i=0; i<16; i++) {
    var scale = Math.random()*0.7+0.5;
    var a = Math.random()*Math.PI*2;
    var d = ball.radius*(0.5+Math.random()*0.5);
    var x1 = x+Math.cos(a)*d/WORLD_SCALE;
    var y1 = y+Math.sin(a)*d/WORLD_SCALE;
    var ball1 = addBall(Math.random()<0.3 ? 3 : frame+1, scale);
    ball1.body.SetPositionAndAngle(new b2d.b2Vec2(x1, y1), a);
  }

  for (var body = world.GetBodyList(); body; body = body.GetNext()) {
    ball = body.userData;
    if (!ball) { continue; }
    var bpt = body.GetPosition();
    var dx = bpt.x-x;
    var dy = bpt.y-y;
    var d = Math.sqrt(dx*dx+dy*dy);
    if (d >= maxD) { continue; }
    var force = (maxD-d)/maxD*maxF*(ball.type == 0 ? 1 : 0.01);
    var a = Math.atan2(dy, dx);
    body.ApplyImpulse(new b2d.b2Vec2( Math.cos(a)*force, Math.sin(a)*force), bpt);
  }

}


