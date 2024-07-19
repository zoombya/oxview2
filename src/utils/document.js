import {App} from '../app.js';
import * as THREE from '/node_modules/three/build/three.module.js';



class oxDocument extends THREE.Group{

    constructor(){
        super();
        this.app = new App();

        //for(let i = 0; i<10; i++){
            //this.loadConf('./demo/init.top','./demo/relaxed.dat');
             //this.loadConf("./demo/snubCube.top", "./demo/snubCube.dat");
            this.loadConf('./demo/tetDimer.top','./demo/tetDimer.dat');
            //this.loadConf('./demo/square.top','./demo/square.dat');
        //}
        //this.add(this.addSpheres(2000));
        this.app.scene.add(this);
    }

    loadConf(top_path,dat_path){
        const textureLoader = new THREE.TextureLoader()
        //D0CCCB_524D50_928891_727581 on page 30
        //https://github.com/nidorx/matcaps/blob/master/PAGE-30.md
        const matcap = textureLoader.load('./matcaps/05.png', (texture)=>{
            // after loading texture, always render once
            this.app.render();
        })
        matcap.minFilter = THREE.NearestFilter
        matcap.magFilter = THREE.NearestFilter
        matcap.generateMipmaps = false
        const material = new THREE.MeshMatcapMaterial({
            matcap:matcap
        });

        material.depthTest = true
        material.depthWrite = true
        
        
        //material.metalness = 5;

        //const material = new THREE.MeshLambertMaterial();
        
        // load the configuration file
        // create a web worker to parse the configuration file
        let particle_count, stand_count, strand_ids, nuc_ids;
        const pworker = new Worker('/src/utils/file_worker.js');
       
        pworker.onmessage = event => {
            console.log("got message from worker");
            const startTime = performance.now();
            const { coordinates } = event.data;

           
            const bb_geometry = new THREE.SphereGeometry(.2,14,14);
            const bbSpheres = new THREE.InstancedMesh(bb_geometry, material, particle_count);
            
            
            const nucGeometry = new THREE.SphereGeometry(.3,10,10);
            nucGeometry.scale(0.7, 0.3, 0.7)
            const nucSpheres = new THREE.InstancedMesh(nucGeometry, material, particle_count);
            
            const conGeometry = new THREE.CylinderGeometry(.1,.1, 0.8147053, 8);
            const conCylinders = new THREE.InstancedMesh(conGeometry, material, particle_count);

            const bbconGeometry = new THREE.CylinderGeometry(0.13, 0.05, 1, 8);
            const bbCylinders = new THREE.InstancedMesh(bbconGeometry, material, particle_count);

        
            const dummy = new THREE.Object3D();
            const bbdummy = new THREE.Object3D();
            // save dummy's default rotation
            const dummy_rot = dummy.quaternion.clone();

            let bbLast = new THREE.Vector3(0, 0, 0)
    
            for (let i = 0; i < particle_count; i++) {
                const {x, y, z, a1x, a1y, a1z, a3x, a3y, a3z} = coordinates[i];//.split(' ').map(parseFloat);
              
                let p = new THREE.Vector3(x, y, z);
                let a1 = new THREE.Vector3(a1x, a1y, a1z);
                let a3 = new THREE.Vector3(a3x, a3y, a3z);
                let a2 = a1.clone().cross(a3);

                // compute the backbone position
                const bbPosition = new THREE.Vector3(
                    p.x - (0.34 * a1.x + 0.3408 * a2.x),
                    p.y - (0.34 * a1.y + 0.3408 * a2.y),
                    p.z - (0.34 * a1.z + 0.3408 * a2.z)
                );
                //set the bbPosition and color
                dummy.position.copy(bbPosition);
                dummy.updateMatrix();
                bbSpheres.setMatrixAt(i, dummy.matrix);
                // signature oxview stand colors
                bbSpheres.setColorAt(i, oxStrandColors[strand_ids[i]%4]);

                //compute nucleoside position
                let ns = new THREE.Vector3(
                    p.x + 0.4 * a1.x,
                    p.y + 0.4 * a1.y,
                    p.z + 0.4 * a1.z
                )

                //compute base rotation for the nucleoside
                let nuc_rot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0),a3)
                //set the nucleoside position and color
                dummy.position.copy(ns);
                // apply the nucleoside rotation
                dummy.quaternion.copy(nuc_rot);
                dummy.updateMatrix();
                nucSpheres.setMatrixAt(i, dummy.matrix);
                const cid = nucleosides_to_index[nuc_ids[i]];
                if (cid === undefined) {
                    //default to grey
                    nucSpheres.setColorAt(i, nucleosideColors[nucleosideColors.length-1]);
                }else{
                    nucSpheres.setColorAt(i, nucleosideColors[cid]);
                }  

        
                // compute connector position
                const con = bbPosition.clone().add(ns).divideScalar(2);
                // compute connector rotation
                const rotationCon = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 1, 0),
                    con.clone().sub(ns).normalize());

                dummy.position.copy(con);
                dummy.quaternion.copy(rotationCon);
                dummy.updateMatrix();
                conCylinders.setMatrixAt(i, dummy.matrix);
                conCylinders.setColorAt(i, oxStrandColors[strand_ids[i]%4]);
                
                
                // compute the backbone connector position
                // we want to detect 3' | so a we start it's a 3' and all follow ups will be for strand_ids i != i-1 
                const bbCon = bbPosition.clone().add(bbLast).divideScalar(2);
                if(i ==0 || strand_ids[i] != strand_ids[i-1]){
                    bbdummy.scale.set(0, 0, 0);
                }
                else{
                    //do math as we only care for rotation if we are no 3'
                    const rotationBbCon = new THREE.Quaternion().setFromUnitVectors(
                            new THREE.Vector3(0, 1, 0),
                            bbPosition.clone().sub(bbLast).normalize()
                    );
                    bbdummy.quaternion.copy(rotationBbCon);
                    bbdummy.scale.set(1, bbPosition.clone().sub(bbLast).length(), 1);
                }
                bbdummy.position.copy(bbCon);
                bbdummy.updateMatrix()
                bbCylinders.setMatrixAt(i, bbdummy.matrix);
                bbCylinders.setColorAt(i, oxStrandColors[strand_ids[i]%4]);
                // we can't really get rid of bbLast as we otherwise would need to fetch it from the dummy matrix
                bbLast.copy(bbPosition)
          }
          
            this.add(bbSpheres);
            this.add(nucSpheres);
            this.add(conCylinders);
            this.add(bbCylinders);
            this.app.render();
          };

        // fetch the topology file
        fetch(top_path).then(response => response.text())
        .then(text=>{
            //super simple top 1.0 parser
            //parse the strand information
            let lines = text.split('\n');
            [particle_count, stand_count] = lines[0].split(' ').map(s=>s.trim()).map(parseFloat);
            console.log(particle_count, stand_count);
            strand_ids = new Array(particle_count);
            nuc_ids = new Array(particle_count);

            for(let i = 1; i<particle_count+1; i++){
                const top_line = lines[i].split(' ')
                strand_ids[i-1] = top_line[0];
                nuc_ids[i-1] = top_line[1];
           }
           
            // send the configuration file to the worker
            fetch(dat_path)
            .then(response => response.text())
            .then(text => pworker.postMessage({ text }));
        })

    }

    addSpheres(count = 100){
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

// Default colors for the backbones
const oxStrandColors = [
        new THREE.Color(0xfdd291), //light yellow
        
        new THREE.Color(0xffb322), //goldenrod

        new THREE.Color(0x437092), //dark blue

        new THREE.Color(0x6ea4cc), //light blue
        ];


const nucleosides_to_index = {
    "A": 0,
    "G": 1,
    "C": 2,
    "T": 3,
    "U": 3,
}


const nucleosideColors = [
    new THREE.Color(0x4747B8), //A or K; Royal Blue

    new THREE.Color(0xFFFF33), //G or C; Medium Yellow
    
     //C or A
        new THREE.Color(0x8CFF8C), //Medium green

     //T/U or T
        new THREE.Color(0xFF3333), //Red

     //E
        new THREE.Color(0x660000), //Dark Brown

     //S
        new THREE.Color(0xFF7042), //Medium Orange

     //D
        new THREE.Color(0xA00042), //Dark Rose

     //N
        new THREE.Color(0xFF7C70), //Light Salmon

     //Q
        new THREE.Color(0xFF4C4C), //Dark Salmon

     //H
        new THREE.Color(0x7070FF), //Medium Blue

     //G
        new THREE.Color(0xEBEBEB), // light GREY

     //P
        new THREE.Color(0x525252), //Dark Grey

     //R
        new THREE.Color(0x00007C), //Dark Blue

     //V
        new THREE.Color(0x5E005E), //Dark Purple

     //I
        new THREE.Color(0x004C00), //Dark Green

     //L
        new THREE.Color(0x455E45), //Olive Green

     //M
        new THREE.Color(0xB8A042), //Light Brown

     //F
        new THREE.Color(0x534C42), //Olive Grey

     //Y
        new THREE.Color(0x8C704C), //Medium Brown

     //W
        new THREE.Color(0x4F4600), //Olive Brown
    //default
        new THREE.Color(0x333333), //grey
];

export {oxDocument};