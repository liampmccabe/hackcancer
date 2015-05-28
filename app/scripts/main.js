'use strict';

// Matter.js - http://brm.io/matter-js/

setTimeout(function() {
  document.getElementById('signup').className += 'visible';
}, 3000);

setTimeout(function() {
  document.getElementById('social').className += 'visible';
}, 5000);

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

        // run the engine
        Engine.run(_engine);

        // set up a scene with bodies
        Demo['cells']();

    };



    // call init when the page has loaded fully
    if (window.addEventListener) {
      window.addEventListener('load', Demo.init);
    } else if (window.attachEvent) {
      window.attachEvent('load', Demo.init);
    }



    Demo.cells = function() {

      var _world = _engine.world;
      
      Demo.reset();

      _engine.world.gravity.y = 0;
      _engine.world.gravity.x = 0;

      var renderOptions = _engine.render.options;
      renderOptions.wireframes = false;
      renderOptions.width = window.innerWidth*2;
      renderOptions.height = window.innerHeight*2;
      renderOptions.showAngleIndicator = false;
      renderOptions.background = 'rgba(255,255,255,0)';

      _engine.render.canvas.width = window.innerWidth*2;
      _engine.render.canvas.height = window.innerHeight*2;

      _engine.world.bounds.max.x = window.innerWidth;
      _engine.world.bounds.max.y = window.innerHeight;

      _engine.render.context.scale(2,2);

      var offset = 0;
      World.add(_world, [

          Bodies.rectangle(0, 0, 10, window.innerHeight*2, { isStatic: true, render: { fillStyle: 'rgba(255,255,255,0)', strokeStyle: 'rgba(255,255,255,0)'} }),

          Bodies.rectangle(window.innerWidth, 0, 10, window.innerHeight*2, { isStatic: true, render: { fillStyle: 'rgba(255,255,255,0)', strokeStyle: 'rgba(255,255,255,0)'} }),

          Bodies.rectangle(0, 0, window.innerWidth*2, 10, { isStatic: true, render: { fillStyle: 'rgba(255,255,255,0)', strokeStyle: 'rgba(255,255,255,0)'} }),

          Bodies.rectangle(0, window.innerHeight, window.innerWidth*2-10, 10, { isStatic: true, render: { fillStyle: 'rgba(255,255,255,0)', strokeStyle: 'rgba(255,255,255,0)'} })
      ]);


      var cellCount = 0,
          maxCells = 0;

      maxCells = Math.floor(window.innerWidth/10);

      var cell = function(xx,yy,radius) {

        //Some cell variables
        var opacity = Common.random(3,80)/100;
        opacity = opacity.toFixed(2);


        //The main cell composite
        var cellComposite = Composite.create({ label: 'Cell' });

        //Membrane body - outer circle
        var membrane = Bodies.circle(xx, yy, radius, {
          label: 'Membrane',
          friction: 0.00001, 
          restitution: 0.0001, 
          density: 0.1,
          render: {
            fillStyle: 'rgba(255,255,255,0)',
            fillStyleTo: 'rgba(255,255,255,0)',
            strokeStyle: 'rgba(255,255,255,0)',
            strokeStyleTo: 'rgba(255,255,255,'+opacity+')',
            lineWidth: 2
          }
        });

        //Nucleus body - inner circle
        var nucleus = Bodies.circle(xx, yy, radius/5, {
          label: 'Nucleus',
          friction: 0, 
          restitution: 0, 
          density: 0.1,
          render: {
            fillStyle: 'rgba(255,255,255,0)',
            fillStyleTo: 'rgba(255,255,255,'+opacity+')',
            strokeStyle: 'rgba(255,255,255,0)',
            lineWidth: 0
          }
        });

        //Add a bodies to the composite
        Composite.addBody(cellComposite, membrane);
        Composite.addBody(cellComposite, nucleus);

        //Reset nucleus physics
        nucleus.slop = 0;
        nucleus.friction = 0;
        nucleus.density = 0;
        nucleus.inertia = 0;

        if(Common.random(1,600) > 560) {
          cellComposite.cancer = true;
        }

        cellComposite.bodies[0].parentId = cellComposite.id;

        return cellComposite;
      }


      _sceneEvents.push(

        // an example of using collisionStart event on an engine
        Events.on(_engine, 'collisionStart', function(event) {

          var pairs = event.pairs;

          var cells = Composite.allComposites(_engine.world);

          for (var i = 0; i < cells.length; i++) {

            var cell = cells[i];
            var membrane = cell.bodies[0];

            if(membrane.id == pairs[0].bodyA.id) {
              if(Common.random(0,10) > 9) {
                cell.cancer = true;
              }
            }

          }

        })

      );



      _sceneEvents.push(

        // an example of using beforeUpdate event on an engine
        Events.on(_engine, 'beforeUpdate', function(event) {

          var engine = event.source;

          if (event.timestamp % 10 < 20) {

            flow(engine);

            if(++cellCount < maxCells) {

              var x = Common.random(50, window.innerWidth-50);
              var y = Common.random(50, window.innerHeight-50);
              var radius = Common.random(3, 30);

              World.add(_world, cell(x, y, radius));

            }
            
          }
              
        })

      );

      var flow = function(engine) {

        var cells = Composite.allComposites(engine.world);

        for (var i = 0; i < cells.length; i++) {

          var cell = cells[i];
          var nucleus = cell.bodies[1];
          var membrane = cell.bodies[0];
          var forceMagnitude;

          if(cell.cancer) {
            nucleus.render.fillStyle = tween(nucleus.render.fillStyle, 'rgba(255,0,0,0.8)');
            membrane.render.fillStyle = tween(membrane.render.fillStyle, 'rgba(255,0,0,0)');
            membrane.render.strokeStyle = tween(membrane.render.strokeStyle, 'rgba(255,0,0,0.8)');
          } else {
            nucleus.render.fillStyle = tween(nucleus.render.fillStyle, nucleus.render.fillStyleTo);
            membrane.render.fillStyle = tween(membrane.render.fillStyle, membrane.render.fillStyleTo);
            membrane.render.strokeStyle = tween(membrane.render.strokeStyle, membrane.render.strokeStyleTo);
          }

          nucleus.position.x = membrane.position.x;
          nucleus.position.y = membrane.position.y;

          if(cell.cancer)
            forceMagnitude = 0.005 * cell.bodies[1].mass;
          else
            forceMagnitude = 0.0002 * cell.bodies[1].mass;

          Body.applyForce(cell.bodies[0], { x: 0, y: 0 }, { 
              x: (forceMagnitude + Common.random(-1,1) * forceMagnitude) * Common.choose([1, -1]), 
              y: (forceMagnitude + Common.random(-1,1) * forceMagnitude) * Common.choose([1, -1])
          });

        }
      };

      var tween = function(from, to) {

        var prevColor = {}, 
            nextColor = {};

        prevColor.r = parseInt(from.split(',')[0].split('(')[1]);
        prevColor.g = parseInt(from.split(',')[1]);
        prevColor.b = parseInt(from.split(',')[2]);
        prevColor.a = parseFloat(from.split(',')[3]);

        nextColor.r = parseInt(to.split(',')[0].split('(')[1]);
        nextColor.g = parseInt(to.split(',')[1]);
        nextColor.b = parseInt(to.split(',')[2]);
        nextColor.a = parseFloat(to.split(',')[3]);

        if(prevColor.r != nextColor.r)
          prevColor.r = (prevColor.r < nextColor.r) ? prevColor.r += 10 : prevColor.r -= 10;

        if(prevColor.g != nextColor.g)
          prevColor.g = (prevColor.g < nextColor.g) ? prevColor.g += 10 : prevColor.g -= 10;
        
        if(prevColor.b != nextColor.b)
          prevColor.b = (prevColor.b < nextColor.b) ? prevColor.b += 10 : prevColor.b -= 10;

        if(prevColor.a != nextColor.a)
          prevColor.a = (prevColor.a < nextColor.a) ? prevColor.a += 0.01 : prevColor.a -= 0.01;

        from = 'rgba('+prevColor.r+','+prevColor.g+','+prevColor.b+','+prevColor.a+')';

        return from;

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

      if (_world.events) {
          for (i = 0; i < _sceneEvents.length; i++)
              Events.off(_world, _sceneEvents[i]);
      }

      _sceneEvents = [];

      // reset id pool
      Common._nextId = 0;

      // reset random seed
      Common._seed = 0;

      _engine.enableSleeping = false;
      _engine.world.gravity.y = 1;
      _engine.world.gravity.x = 0;
      _engine.timing.timeScale = 1;
      
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
