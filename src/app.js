//import {TrackballControls} from '../node_modules/three/examples/jsm/controls/TrackballControls.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

import {oxDocument} from './utils/document.js';
import {N8AOPostPass} from "n8ao";
import { EffectComposer, RenderPass, SMAAEffect, EffectPass } from "postprocessing";
import {SMAAPreset, OutlineEffect} from 'postprocessing';
import {AxisArrows} from './utils/axisArraows.js';
import Stats from '../node_modules/stats-gl';
import { TransformControls } from '../node_modules/three/examples/jsm/controls/TransformControls.js';

// global variables for transform controls and controls
// just to get around the bound events 
let transformControls = null;
let controls = null;
let docs = null;

class App{
    constructor(){
        //app is a singleton
        if(App.instance){
            return App.instance;
        }
        App.instance = this;

        //set up scene, camera, and renderer
        this.scene  = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000)//new THREE.Color(0xFFFFFF);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(1,1);

        // const environment = new THREE.CubeTextureLoader().load([
        //     "skybox/Box_Right.bmp",
        //     "skybox/Box_Left.bmp",
        //     "skybox/Box_Top.bmp",
        //     "skybox/Box_Bottom.bmp",
        //     "skybox/Box_Front.bmp",
        //     "skybox/Box_Back.bmp"
        // ]);
        // environment.colorSpace = THREE.SRGBColorSpace;
        // this.scene.environmentMap = environment;


        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight,1,10000);
        this.camera.position.set(100,0,0);


        this.renderer = new THREE.WebGLRenderer ({
            canvas: document.querySelector('#canvas'),
            powerPreference: "high-performance",
            antialias: false,
            stencil: false,
            depth: false
        });

        //make cinematic
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

        this.renderer.setPixelRatio( window.devicePixelRatio);
        this.renderer.setSize( window.innerWidth, window.innerHeight);


        // stats
		this.stats = new Stats( {
			precision: 3,
			horizontal: false
		} );
		this.stats.init( this.renderer );
		document.body.appendChild( this.stats.dom );
		this.stats.dom.style.position = 'absolute';


        
        //add a render pass 
        // N8AOPass replaces RenderPass
        this.n8aopass = new N8AOPostPass(
                this.scene,
                this.camera,
                window.innerWidth, 
                window.innerHeight
            );

        //set the quality mode to low
        this.n8aopass.setQualityMode("High");
        this.n8aopass.configuration.intensity = 8;
        //this.n8aopass.configuration.renderMode = 1;

        this.composer = new EffectComposer(this.renderer);
        /* Only difference is that N8AOPostPass requires a RenderPass before it, 
            whereas N8AOPass replaces the render pass. Everything else is identical. */
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(this.n8aopass);
        this.composer.addPass(new EffectPass(this.camera, new SMAAEffect(SMAAPreset.HIGH)));
 


        //bind render function to this
        this.render = this.render.bind(this);
        //bind animate function to this
        this.animate = this.animate.bind(this);
        

        this.light = new THREE.PointLight(0xffffff, 1, 1000);
        this.light.position.set(0, 0, 0);
        this.light.castShadow = true;
        this.light.position.set(-50, -50, 50);
        this.scene.add(this.light)
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));

          
        window.addEventListener('keydown', function(event) {
           switch (event.code) {
            case 'KeyT':
                    transformControls.setMode("translate");
                break;
            case 'KeyR':
                    transformControls.setMode("rotate");
                break;
            
           }
        });
                
        //add controls
        //this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.addEventListener('change', (event)=>{
            //make the light follow the camera
            this.render();
        });

        //  dirty hack to make controls available for transform controls
        controls = this.controls;
        this.controls.daming = 0.2;


        //fix window resize
        window.addEventListener('resize', ()=>{
            this.camera.aspect = window.innerWidth/window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.composer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.render();
        });

        document.addEventListener('mousemove', (event)=>{
            this.mouse.x = (event.clientX/window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY/window.innerHeight) * 2 + 1;
        });

        //populate scene with random demo stuff
        this.documents = [
            new oxDocument(),
        ];
        // just again a dirty hack to make the documents available for the keybinding etc.
        docs = this.documents;

        this.transformControl = new TransformControls(this.camera, this.renderer.domElement)
        this.transformControl.attach(this.documents[0]);
        
        this.scene.add(this.transformControl)
        //dirty hack to make the transform control work in the keybinding
        transformControls = this.transformControl;

        this.transformControl.addEventListener( 'change', this.render );
		this.transformControl.addEventListener( 'dragging-changed', function ( event ) {
            controls.enabled = ! event.value;
		} );
		

        //add axes helper
        this.scene.add(new AxisArrows());

        //render once
        this.render();
        
        //enable animation loop
        this.animate();
    }

    render(){
        this.composer.render();
        //this.renderer.render(this.scene, this.camera);
    }

    animate(){

        // raycasting selector
        //// this.raycaster.setFromCamera( this.mouse, this.camera );
        //// const intersection = this.raycaster.intersectObjects( this.scene.children, true );
        //// if ( intersection.length > 0 && intersection[ 0 ].object.isInstancedMesh ) {
        ////     const instanceId = intersection[ 0 ].instanceId;
        ////     console.log(instanceId);
        ////     const mesh = intersection[ 0 ].object; 
        ////     const doc = mesh.document;
        ////     console.log(doc);
        ////     doc.children.forEach(mesh => {
        ////         mesh.setColorAt( instanceId, new THREE.Color( 0xff00ff ) );
        ////         mesh.instanceColor.needsUpdate = true;
        ////     });
        ////     this.render();
        ////     //mesh.setColorAt( instanceId, new THREE.Color( 0xff0000 ) );
        ////     //mesh.getColorAt( instanceId, color );
        //// }


		//const intersection = this.raycaster.intersectObject( this.scene.children);
        
        // if ( intersection.length > 0 ) {
        //     console.log(intersection[0].object);
        // }

        //this.render();
        //this.documents[0].rotation.x += 0.001;
        // this.documents[0].rotation.y += 0.001;
        // this.render();
        
        //make the light follow the camera
        //this.light.position.copy(this.camera.position);
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.stats.update();
    }

}
// make sure that app is accessible to the rest of the applictaion
export {App};