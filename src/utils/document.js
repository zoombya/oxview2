import {App} from '../app.js';
import * as THREE from '/node_modules/three/build/three.module.js';

class oxDocument extends THREE.Group{
    constructor(){
        super();
        this.app = new App();
        this.meshes = [this.addSpheres(2000)];
        this.children.push(...this.meshes);
        this.app.scene.add(this);

    }

    addSpheres(count = 100){
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
        //this.scene.add(spheres);
        return spheres;
    }

}
export {oxDocument};