import './style.css';
import * as THREE from '/node_modules/three/build/three.module.js';
import {App} from './src/app.js';


//Make sure that ThreeJS is accessible in the console
window.THREE = THREE;
//Expose app to the console
window.app = new App();