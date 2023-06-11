onmessage = event => {
    const { text } = event.data;
    let lines = text.trim().split('\n').slice(3);
    const coordinates = [];
  
    for (let i = 0; i < lines.length; i++) {
      const [x, y, z, a1x, a1y, a1z, a3x, a3y, a3z] = lines[i].split(' ').map(parseFloat);
      coordinates.push({ x, y, z, a1x, a1y, a1z, a3x, a3y, a3z });
    }
  
    postMessage({ coordinates });
  };

// const imports = {
//     env: {
//       memoryBase: 0,
//       tableBase: 0,
//       memory: new WebAssembly.Memory({ initial: 256 }),
//       table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
//     }
//   };

// onmessage = async event => {
//     const parserModule = new WebAssembly.Module(await fetch('/src/utils/parser.wasm').then(response => response.arrayBuffer()));
//     const parserInstance = new WebAssembly.Instance(parserModule, imports);

//     // Parse the configuration file using the WebAssembly module
//     const startTime = performance.now();
//     const coordinates = parserInstance.exports.parseConfiguration(text);
//     const endTime = performance.now();

//     console.log(`Parsing took ${endTime - startTime} milliseconds`);

//     // Send the parsed data back to the main thread
//     postMessage({ coordinates });
// }