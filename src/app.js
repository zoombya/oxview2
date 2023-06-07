import {TrackballControls} from '../node_modules/three/examples/jsm/controls/TrackballControls.js';
// import {Settings} from './utils/settings.js';

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

        // //load settings
        // this.settings = new Settings();
        // //this.settings.clear();
        // this.settings.apply();

        //populate scene with random demo stuff
        //this.addSphere(2000000*4); #stress test
        this.addSphere(2000);
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


    addSphere(count = 100){
        //add a ton of spheres to simulate a particle system
        const geometry = new THREE.SphereGeometry(.1,8,8);
        const material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide});
        const spheres = new THREE.InstancedMesh(geometry, material, count);
        
        //set a random position within a box of 10x10x10
        //for each instance
        const dummy = new THREE.Object3D();
        for(let i = 0; i<count; i++){
            dummy.position.set(
                Math.random()*20-10,
                Math.random()*20-10,
                Math.random()*20-10
            );
            dummy.updateMatrix();
            spheres.setMatrixAt(i, dummy.matrix);
            spheres.setColorAt(i, new THREE.Color(Math.random(), Math.random(), Math.random()));
        }
        this.scene.add(spheres);
        return spheres;
    }

}
// make sure that app is accessible to the rest of the applictaion
export {App};