import WebGL from './WebGL';
import deviceType from 'ua-device-type';
import LOL from './LOL';
import domReady from 'domready';
import raf from 'raf';
import dat from 'dat-gui';
import 'gsap';

// Vars
window.DEBUG = false;
let device;
let webGL;


function animate() {
  raf(animate);
  webGL.render();
}

// Events
function resize() {
  webGL.resize(window.innerWidth, window.innerHeight);
}
// KeyBoard
function keyPress(e) {
  webGL.keyPress(e);
}
function keyDown(e) {
  webGL.keyDown(e);
}
function keyUp(e) {
  webGL.keyUp(e);
}
// Mouse
function click(e) {
  webGL.click(e.clientX, e.clientY, e.timeStamp);
}
function mouseMove(e) {
  webGL.mouseMove(e.clientX, e.clientY, e.timeStamp);
}
// Touch
function touchStart(e) {
  webGL.touchStart(e.touches);
}
function touchEnd(e) {
  webGL.touchEnd(e.touches);
}
function touchMove(e) {
  webGL.touchMove(e.touches);
}

domReady(() => {
  console.log('%c WebGL by Jordan Machado | twitter @xvi_jojo', 'background:#000000;color:#ffffff');
  device = deviceType(navigator.userAgent);
  document.querySelector('html').classList.add(device);

  if (window.DEBUG || window.DEVMODE) {
    window.gui = new dat.GUI();
  } else {
    console.warn = function warn() {};
  }
  // WebGL
  webGL = new WebGL({
    device,
    name: 'EXPERIMENT GREG',
    postProcessing: true,
    size: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    keyboard: false,
    mouse: device !== 'phone',
    touch: device === 'phone',
  });

  // const links = document.querySelectorAll('a');
  // for (let i = 0; i < links.length; i++) {
  //   links[i].addEventListener('mouseenter', () => {
  //     webGL.hover();
  //   });
  // }
  document.body.appendChild(webGL.renderer.domElement);
  const tl = new TimelineLite();
  tl.to(document.querySelector('h1'), 2, {
    autoAlpha: 1,
    delay: 0.4,
    ease: Quad.easeOut,
  });
  tl.to(document.querySelector('canvas'), 2, {
    autoAlpha: 1,
    ease: Quad.easeOut,
  }, '-=1.8');
  tl.to(document.querySelector('.projects'), 2, {
    autoAlpha: 1,
    ease: Quad.easeOut,
  }, '-=1.6');
  tl.to(document.querySelector('.socials'), 2, {
    autoAlpha: 1,
    ease: Quad.easeOut,
  }, '-=1.6');

  // Events
  window.addEventListener('resize', resize);
  // KeyBoard
  window.addEventListener('keypress', keyPress);
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  // Mouse
  window.addEventListener('click', click);
  window.addEventListener('mousemove', mouseMove);
  // Touch
  window.addEventListener('touchstart', touchStart);
  window.addEventListener('touchend', touchEnd);
  window.addEventListener('touchmove', touchMove);

  // let's start
  animate();
});
