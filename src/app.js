import {TrackballControls} from '../node_modules/three/examples/jsm/controls/TrackballControls.js';
import {oxDocument} from './utils/document.js';

class App{
    constructor(){
        //app is a singleton
        if(App.instance){
            return App.instance;
        }
        App.instance = this;

        //set up scene, camera, and renderer
        this.scene  = new THREE.Scene();
        this.scene.background = new THREE.Color(0xFFFFFF);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#canvas'),
        });
        this.renderer.setPixelRatio( window.devicePixelRatio);
        this.renderer.setSize( window.innerWidth, window.innerHeight);
        this.camera.position.setZ(30);
        
        //add a light   
        this.light = new THREE.PointLight(0xffffff, 1);
        //this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.lookAt(0,0,0);
        this.light.position.copy(this.camera.position);
        this.scene.add(this.light);


        //bind render function to this
        this.render = this.render.bind(this);
        //bind animate function to this
        this.animate = this.animate.bind(this);
        
        //add controls
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.addEventListener('change', this.render);
        this.controls.rotateSpeed = 2.0;

        //fix window resize
        window.addEventListener('resize', ()=>{
            this.camera.aspect = window.innerWidth/window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.render();
        });

        //populate scene with random demo stuff
        this.documents = [
            new oxDocument()
        ];

        //render once
        this.render();
        
        //enable animation loop
        this.animate();
    }

    render(){
        this.renderer.render(this.scene, this.camera);
    }

    animate(){
        //make the light follow the camera
        this.light.position.copy(this.camera.position);
        requestAnimationFrame(this.animate);
        this.controls.update();
    }

}
// make sure that app is accessible to the rest of the applictaion
export {App};