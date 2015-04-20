"use strict";var Engine=Matter.Engine,World=Matter.World,Bodies=Matter.Bodies,Body=Matter.Body,Composite=Matter.Composite,Composites=Matter.Composites,Common=Matter.Common,Constraint=Matter.Constraint,Events=Matter.Events,Bounds=Matter.Bounds,Vector=Matter.Vector,MouseConstraint=Matter.MouseConstraint,Mouse=Matter.Mouse,Query=Matter.Query;if(window.MatterTools)var Gui=MatterTools.Gui,Inspector=MatterTools.Inspector;var Demo={},_engine,_gui,_inspector,_sceneName,_mouseConstraint,_sceneEvents=[],_useInspector=-1!==window.location.hash.indexOf("-inspect"),_isMobile=/(ipad|iphone|ipod|android)/gi.test(navigator.userAgent);Demo.init=function(){var e=document.getElementById("cells"),n={positionIterations:6,velocityIterations:4,enableSleeping:!1};_engine=Engine.create(e,n),Engine.run(_engine),Demo.gravity()},window.addEventListener?window.addEventListener("load",Demo.init):window.attachEvent&&window.attachEvent("load",Demo.init),Demo.gravity=function(){var e=_engine.world;Demo.reset(),_engine.world.gravity.y=0,_engine.world.gravity.x=0;var n=_engine.render.options;n.wireframes=!1,n.width=2*window.innerWidth,n.height=2*window.innerHeight,n.showAngleIndicator=!1,n.background="rgba(255,255,255,0)",_engine.render.canvas.width=2*window.innerWidth,_engine.render.canvas.height=2*window.innerHeight,_engine.world.bounds.max.x=window.innerWidth,_engine.world.bounds.max.y=window.innerHeight,_engine.render.context.scale(2,2);var o=0,t=[];_sceneEvents.push(Events.on(_engine,"beforeUpdate",function(n){var r=n.source;if(n.timestamp%10<50&&(i(r),500>o)){++o,t[o]={},t[o].opacity=0,t[o].maxOpacity=Common.random(0,10)/100,t[o].radius=0,t[o].maxRadius=Common.random(4,30);var a=Common.random(0,window.innerWidth),s=Common.random(0,window.innerHeight);World.add(e,Bodies.circle(a,s,t[o].maxRadius,{friction:1e-5,restitution:1e-4,density:.1,render:{fillStyle:"rgba(255,255,255,0)",strokeStyle:"rgba(255,255,255,0)",lineWidth:2}}))}}));var i=function(e){for(var n=Composite.allBodies(e.world),o=0;o<n.length;o++){var i=n[o];if("undefined"!=typeof t[o]&&t[o].opacity<t[o].maxOpacity&&(t[o].opacity+=.001,i.render.strokeStyle="rgba(255,255,255,"+t[o].opacity+")"),!i.isStatic&&Common.random(0,500)>450){var r=1e-4*i.mass;Body.applyForce(i,{x:0,y:0},{x:(r+Common.random(-.2,.2)*r)*Common.choose([1,-1]),y:(r+Common.random(-.2,.2)*r)*Common.choose([1,-1])})}}}},Demo.reset=function(){var e=_engine.world;World.clear(e),Engine.clear(_engine);var n=_engine.render.controller;n.clear&&n.clear(_engine.render);for(var o=0;o<_sceneEvents.length;o++)Events.off(_engine,_sceneEvents[o]);if(e.events)for(o=0;o<_sceneEvents.length;o++)Events.off(e,_sceneEvents[o]);_sceneEvents=[],Common._nextId=0,Common._seed=0,_engine.enableSleeping=!1,_engine.world.gravity.y=1,_engine.world.gravity.x=0,_engine.timing.timeScale=1;var t=_engine.render.options;t.wireframes=!0,t.hasBounds=!1,t.showDebug=!1,t.showBroadphase=!1,t.showBounds=!1,t.showVelocity=!1,t.showCollisions=!1,t.showAxes=!1,t.showPositions=!1,t.showAngleIndicator=!0,t.showIds=!1,t.showShadows=!1,t.background="#fff",_isMobile&&(t.showDebug=!0)},setTimeout(function(){document.getElementsByClassName("overlay")[0].className+=" visible"},4e3);