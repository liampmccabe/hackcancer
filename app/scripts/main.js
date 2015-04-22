'use strict';

/* jshint devel:true */

// Matter.js - http://brm.io/matter-js/

// Matter module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    Constraint = Matter.Constraint,
    Events = Matter.Events,
    Bounds = Matter.Bounds,
    Vector = Matter.Vector,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Query = Matter.Query;

    // MatterTools aliases
    if (window.MatterTools) {
        var Gui = MatterTools.Gui,
            Inspector = MatterTools.Inspector;
    }

    var Demo = {};

    var _engine,
        _gui,
        _inspector,
        _sceneName,
        _mouseConstraint,
        _sceneEvents = [],
        _useInspector = window.location.hash.indexOf('-inspect') !== -1,
        _isMobile = /(ipad|iphone|ipod|android)/gi.test(navigator.userAgent);
    
    // initialise the demo

    Demo.init = function() {

        var container = document.getElementById('cells');

        // some example engine options
        var options = {
          positionIterations: 6,
          velocityIterations: 4,
          enableSleeping: false
        };

        // create a Matter engine
        // NOTE: this is actually Matter.Engine.create(), see the aliases at top of this file
        _engine = Engine.create(container, options);

        // add a mouse controlled constraint
        //_mouseConstraint = MouseConstraint.create(_engine);
        //World.add(_engine.world, _mouseConstraint);

        // run the engine
        Engine.run(_engine);

        // set up a scene with bodies
        Demo['gravity']();

    };

    // call init when the page has loaded fully
    if (window.addEventListener) {
      window.addEventListener('load', Demo.init);
    } else if (window.attachEvent) {
      window.attachEvent('load', Demo.init);
    }

    Demo.gravity = function() {
      var _world = _engine.world;
      
      Demo.reset();

      _engine.world.gravity.y = 0;
      _engine.world.gravity.x = 0;

      /*var stack = Composites.stack(0, 0, 20, 20, 0, 0, function(x, y, column, row) {
        return Bodies.circle(x, y, Common.random(10, 30), { 
          friction: 0.00001, 
          restitution: 0.5, 
          density: 0.001,
          render: {
             fillStyle: 'rgba(255,255,255,0)',
             strokeStyle: 'rgba(255,255,255,'+randomIntInc(0,40)/100+')',
             lineWidth: 2
          }
        });
      });*/

      //World.add(_world, stack);

      var renderOptions = _engine.render.options;
      renderOptions.wireframes = false;
      renderOptions.width = window.innerWidth*2;
      renderOptions.height = window.innerHeight*2;
      //renderOptions.showAxes = true;
      //renderOptions.showCollisions = true;
      //renderOptions.showBounds = true;
      //renderOptions.showIds = true;
      //renderOptions.hasBounds = true;
      renderOptions.showAngleIndicator = false;
      renderOptions.background = 'rgba(255,255,255,0)';
      //renderOptions.wireframeBackground = 'rgba(0,0,0,0)';

      _engine.render.canvas.width = window.innerWidth*2;
      _engine.render.canvas.height = window.innerHeight*2;

      _engine.world.bounds.max.x = window.innerWidth;
      _engine.world.bounds.max.y = window.innerHeight;

      _engine.render.context.scale(2,2);

      //World.add(_world, circle);

      var cellCount = 0;
      var cells = [];
      var nucleus = [];

      _sceneEvents.push(

        // an example of using beforeUpdate event on an engine
        Events.on(_engine, 'beforeUpdate', function(event) {

          var engine = event.source;

          if (event.timestamp % 10 < 50) {

            flow(engine);

            if(cellCount < 350) {
              ++cellCount;

              cells[cellCount] = {};
              cells[cellCount].opacity = 0;
              cells[cellCount].maxOpacity = Common.random(2,12)/100;
              cells[cellCount].radius = 0;
              cells[cellCount].maxRadius = Common.random(4, 30);

              var x = Common.random(0, window.innerWidth);
              var y = Common.random(0, window.innerHeight);

              nucleus[cellCount] = {};

              World.add(_world, Bodies.circle(x, y, cells[cellCount].maxRadius, { 
                friction: 0.00001, 
                restitution: 0.0001, 
                density: 0.1,
                render: {
                  fillStyle: 'rgba(255,255,255,0)',
                  strokeStyle: 'rgba(255,255,255,0)',
                  lineWidth: 2
                }
              }));

              World.add(_world, Bodies.circle(x, y, 3, {
                nucleus: true,
                friction: 0, 
                restitution: 0,
                density: 0,
                render: {
                  fillStyle: 'rgba(255,255,255,'+cells[cellCount].maxOpacity+')',
                  strokeStyle: 'rgba(255,255,255,0)',
                  lineWidth: 0
                }
              }));

            }
            
          }
              
        })

      );

      var flow = function(engine) {
        var bodies = Composite.allBodies(engine.world);

          for (var i = 0; i < bodies.length; i++) {
              var body = bodies[i];

              if(typeof cells[i] !== 'undefined') {

                if(!body.nucleus) {
                  if(i % 20 == 0) {
                    if(cells[i].opacity < cells[i].maxOpacity) {
                      cells[i].opacity += 0.001;
                      body.cancer = true;
                      body.render.fillStyle = 'rgba(255,0,0,'+(cells[i].opacity)+')';
                      body.render.strokeStyle = 'rgba(255,0,0,'+(cells[i].opacity+0.2)+')';
                    }
                  } else {
                    if(cells[i].opacity < cells[i].maxOpacity) {
                      cells[i].opacity += 0.001;
                      body.render.strokeStyle = 'rgba(255,255,255,'+cells[i].opacity+')';
                    }
                  }
                }

                if(body.nucleus && typeof nucleus[i] !== 'undefined') {
                  body.position.x = bodies[i-1].position.x;
                  body.position.y = bodies[i-1].position.y;
                }

              }

              if (!body.isStatic && Common.random(0,100) > 50) {

                if(body.cancer) {
                  var forceMagnitude = 0.001 * body.mass;
                } else {
                  var forceMagnitude = 0.0001 * body.mass;
                }

                Body.applyForce(body, { x: 0, y: 0 }, { 
                    x: (forceMagnitude + Common.random(-0.2,0.2) * forceMagnitude) * Common.choose([1, -1]), 
                    y: (forceMagnitude + Common.random(-0.2,0.2) * forceMagnitude) * Common.choose([1, -1])
                });

              }
          }
        };

    };

    Demo.reset = function() {
      var _world = _engine.world;
      
      World.clear(_world);
      Engine.clear(_engine);

      // clear scene graph (if defined in controller)
      var renderController = _engine.render.controller;
      if (renderController.clear)
          renderController.clear(_engine.render);

      // clear all scene events
      for (var i = 0; i < _sceneEvents.length; i++)
          Events.off(_engine, _sceneEvents[i]);

      /*if (_mouseConstraint.events) {
          for (i = 0; i < _sceneEvents.length; i++)
              Events.off(_mouseConstraint, _sceneEvents[i]);
      }*/

      if (_world.events) {
          for (i = 0; i < _sceneEvents.length; i++)
              Events.off(_world, _sceneEvents[i]);
      }

      _sceneEvents = [];

      // reset id pool
      Common._nextId = 0;

      // reset random seed
      Common._seed = 0;

      // reset mouse offset and scale (only required for Demo.views)
      //Mouse.setScale(_mouseConstraint.mouse, { x: 1, y: 1 });
      //Mouse.setOffset(_mouseConstraint.mouse, { x: 0, y: 0 });

      _engine.enableSleeping = false;
      _engine.world.gravity.y = 1;
      _engine.world.gravity.x = 0;
      _engine.timing.timeScale = 1;

      /*World.add(_world, [
          Bodies.rectangle(640, 330, 360, 200, { 
          isStatic: true,
          friction: 0.00001, 
          restitution: 0.5, 
          density: 0.001,
          render: {
             fillStyle: 'rgba(255,255,255,0)',
             strokeStyle: 'rgba(255,255,255,0)',
          }})
      ]);*/

      /*var offset = 25;
      World.add(_world, [
          Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
          Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
          Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true }),
          Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true })
      ]);*/

      //World.add(_world, _mouseConstraint);
      
      var renderOptions = _engine.render.options;
      renderOptions.wireframes = true;
      renderOptions.hasBounds = false;
      renderOptions.showDebug = false;
      renderOptions.showBroadphase = false;
      renderOptions.showBounds = false;
      renderOptions.showVelocity = false;
      renderOptions.showCollisions = false;
      renderOptions.showAxes = false;
      renderOptions.showPositions = false;
      renderOptions.showAngleIndicator = true;
      renderOptions.showIds = false;
      renderOptions.showShadows = false;
      renderOptions.background = '#fff';

      if (_isMobile)
          renderOptions.showDebug = true;
    };


setTimeout(function() {
  document.getElementsByClassName('overlay')[0].className += ' visible';
}, 4000)

