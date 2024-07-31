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
