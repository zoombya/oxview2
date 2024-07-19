import {TrackballControls} from '../node_modules/three/examples/jsm/controls/TrackballControls.js';
import {oxDocument} from './utils/document.js';
import {N8AOPostPass} from "n8ao";
import { EffectComposer, RenderPass, SMAAEffect, EffectPass } from "postprocessing";
import {SMAAPreset, OutlineEffect} from 'postprocessing';
import {AxisArrows} from './utils/axisArraows.js';
import Stats from '../node_modules/stats-gl';

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


        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight,0.1,1000);
        this.camera.position.set(100,0,0);

        this.renderer = new THREE.WebGLRenderer ({
            canvas: document.querySelector('#canvas'),
            powerPreference: "high-performance",
            antialias: false,
            stencil: false,
            depth: false
        });


        this.renderer.setPixelRatio( window.devicePixelRatio);
        this.renderer.setSize( window.innerWidth, window.innerHeight);
        // this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = THREE.VSMShadowMap;


        // stats
		this.stats = new Stats( {
			precision: 3,
			horizontal: false
		} );
		this.stats.init( this.renderer );
		document.body.appendChild( this.stats.dom );
		this.stats.dom.style.position = 'absolute';
        

        //this.camera.position.setZ(30);

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
        this.n8aopass.configuration.intensity = 5;
        //this.n8aopass.configuration.renderMode = 1;

        this.composer = new EffectComposer(this.renderer);
        /* Only difference is that N8AOPostPass requires a RenderPass before it, 
            whereas N8AOPass replaces the render pass. Everything else is identical. */
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(this.n8aopass);
        this.composer.addPass(new EffectPass(this.camera, new SMAAEffect(SMAAPreset.LOW)));
        //add a light
        // this.light = new THREE.PointLight(0xffffff, 1);
        // this.light.position.copy(this.camera.position);
        //this.scene.add(this.light);


        //bind render function to this
        this.render = this.render.bind(this);
        //bind animate function to this
        this.animate = this.animate.bind(this);
        
        //add controls
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.addEventListener('change', (event)=>{
            //make the light follow the camera
            //this.light.position.copy(this.camera.position);
            this.render();
        });

        // interestingly oxviews 1.0 parameters are smaller than these
        // not sure why , but these feel better
        this.controls.rotateSpeed = 4.5;
        this.controls.zoomSpeed = 3; 
        this.controls.panSpeed = 2.0;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.1;

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
            new oxDocument()
        ];

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
        
        this.raycaster.setFromCamera( this.mouse, this.camera );
        const intersection = this.raycaster.intersectObjects( this.scene.children, true );
       

        if ( intersection.length > 0 && intersection[ 0 ].object.isInstancedMesh ) {

            const instanceId = intersection[ 0 ].instanceId;
            console.log(instanceId);

            const mesh = intersection[ 0 ].object;
            
            const doc = mesh.document;
            console.log(doc);
            //console.log(mesh);
            
            doc.children[0].setColorAt( instanceId, new THREE.Color( 0xff00ff ) );
            doc.children[0].instanceColor.needsUpdate = true;
            
            doc.children[1].setColorAt( instanceId, new THREE.Color( 0xff00ff ) );
            doc.children[1].instanceColor.needsUpdate = true;
            
            doc.children[2].setColorAt( instanceId, new THREE.Color( 0xff00ff ) );
            doc.children[2].instanceColor.needsUpdate = true;
            
            doc.children[3].setColorAt( instanceId, new THREE.Color( 0xff00ff ) );
            doc.children[3].instanceColor.needsUpdate = true;
            


            this.render();
            
            //mesh.setColorAt( instanceId, new THREE.Color( 0xff0000 ) );
            //mesh.getColorAt( instanceId, color );

        }
		//const intersection = this.raycaster.intersectObject( this.scene.children);
        
        // if ( intersection.length > 0 ) {
        //     console.log(intersection[0].object);
        // }

        //this.render();
        //this.documents[0].rotation.x += 0.001;
        //this.documents[0].rotation.y += 0.001;
        
        //make the light follow the camera
        //this.light.position.copy(this.camera.position);
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.stats.update();
    }

}
// make sure that app is accessible to the rest of the applictaion
export {App};