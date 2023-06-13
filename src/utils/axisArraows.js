import * as THREE from 'three';
class AxisArrows extends THREE.Group{
    constructor(){
        super();
        // Add coordinate axes to scene
        let dir = new THREE.Vector3(1, 0, 0);
        const Origin = new THREE.Vector3(0, 0, 0);
        const len = 10;
        let arrowHelper = new THREE.ArrowHelper(dir, Origin, len, 0x800000); //create x-axis arrow
        arrowHelper.name = "x-axis";
        this.add(arrowHelper); //add x-axis 
        dir = new THREE.Vector3(0, 1, 0);
        arrowHelper = new THREE.ArrowHelper(dir, Origin, len, 0x008000);
        arrowHelper.name = "y-axis";
        this.add(arrowHelper); //add y-axis 
        dir = new THREE.Vector3(0, 0, 1);
        arrowHelper = new THREE.ArrowHelper(dir, Origin, len, 0x000080);
        arrowHelper.name = "z-axis";
        this.add(arrowHelper); //add z-axis 
    }
    toggle(){
        this.visible = !this.visible;
    }

}
export { AxisArrows};