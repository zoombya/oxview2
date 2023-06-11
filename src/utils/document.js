import {App} from '../app.js';
import * as THREE from '/node_modules/three/build/three.module.js';



class oxDocument extends THREE.Group{

    // Default colors for the backbones
    oxStrandColors = [
        new THREE.Color(0xfdd291), //light yellow
        
        new THREE.Color(0xffb322), //goldenrod

        new THREE.Color(0x437092), //dark blue

        new THREE.Color(0x6ea4cc), //light blue
        ];

    constructor(){
        super();
        this.app = new App();
        this.loadConf('./demo/init.top','./demo/relaxed.dat');
        //this.add(this.addSpheres(2000));
        this.app.scene.add(this);
    }

    loadConf(top_path,dat_path){
        // const textureLoader = new THREE.TextureLoader()
        // const matcap = textureLoader.load('./matcaps/03.jpg', (texture)=>{
        //     // after loading texture, always render once
        //     this.app.render();
        // })
        // matcap.minFilter = THREE.NearestFilter
        // matcap.magFilter = THREE.NearestFilter
        // matcap.generateMipmaps = false
        // const material = new THREE.MeshMatcapMaterial({
        //     matcap:matcap
        // });

        // material.depthTest = true
        // material.depthWrite = true
        const material = new THREE.MeshPhongMaterial();

        // load the configuration file
        // create a web worker to parse the configuration file
        let particle_count, stand_count, strand_ids;
        const pworker = new Worker('/src/utils/file_worker.js');
       
        pworker.onmessage = event => {
            console.log("got message from worker");
            const startTime = performance.now();
            const { coordinates } = event.data;
            // const geometry = new THREE.SphereGeometry(.3, 10, 10);
            const geometry = new THREE.SphereGeometry(.2,10,10);
            const spheres = new THREE.InstancedMesh(geometry, material, coordinates.length);
            const dummy = new THREE.Object3D();
    
            for (let i = 0; i < coordinates.length; i++) {
                const {x, y, z, a1x, a1y, a1z, a3x, a3y, a3z} = coordinates[i];//.split(' ').map(parseFloat);
              
                let p = new THREE.Vector3(x, y, z);
                let a1 = new THREE.Vector3(a1x, a1y, a1z);
                let a3 = new THREE.Vector3(a3x, a3y, a3z);
                let a2 = a1.clone().cross(a3);

                // compute nucleoside cm
                let ns = new THREE.Vector3(
                    p.x + 0.4 * a1.x,
                    p.y + 0.4 * a1.y,
                    p.z + 0.4 * a1.z
                )

                dummy.position.set(x, y, z);
                //dummy.position.set(ns.x, ns.y, ns.z);
                dummy.updateMatrix();
                spheres.setMatrixAt(i, dummy.matrix);
                
                // signature oxview stand colors
                spheres.setColorAt(i, this.oxStrandColors[strand_ids[i]%4]);
                // random colors
                //spheres.setColorAt(i, new THREE.Color(Math.random(), Math.random(), Math.random()));
            }
          
            this.add(spheres);
            this.app.render();
          };

        // fetch the topology file
        fetch(top_path).then(response => response.text())
        .then(text=>{
            //parse the strand information
            let lines = text.split('\n');
            [particle_count, stand_count] = lines[0].split(' ').map(s=>s.trim()).map(parseFloat);
            console.log(particle_count, stand_count);
            strand_ids = new Array(particle_count);
            for(let i = 1; i<particle_count+1; i++){
                strand_ids[i-1] = lines[i].split(' ')[0];
            }
            //console.log(strand_id);



            // send the configuration file to the worker
            fetch(dat_path)
            .then(response => response.text())
            .then(text => pworker.postMessage({ text }));
        })

    }

    addSpheres(count = 100){

        // const textureLoader = new THREE.TextureLoader();
        // const matcap = textureLoader.load('./matcaps/03.jpg', (texture)=>{
        //     // after loading texture, always render once
        //     this.app.render();
        // });

        // matcap.minFilter = THREE.NearestFilter
        // matcap.magFilter = THREE.NearestFilter
        // matcap.generateMipmaps = false

        // const material = new THREE.MeshMatcapMaterial({
        //     matcap:matcap
        // });

        material.depthTest = true
        material.depthWrite = true
        //add a ton of spheres to simulate a particle system
        const geometry = new THREE.SphereGeometry(.1,10,10);
        const material = new THREE.MeshLambertMaterial({side: THREE.DoubleSide});
        const spheres = new THREE.InstancedMesh(geometry, material, count);
        
        spheres.instanceMatrix.setUsage( THREE.StaticDrawUsage  ); // will be updated every frame
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
        return spheres;
    }

}
export {oxDocument};