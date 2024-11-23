export type MyBuffers = {
  position: WebGLBuffer | null;
  color: WebGLBuffer | null;
}

export function initBuffers(gl: WebGLRenderingContext): MyBuffers {
  const positionBuffer = initPositionBuffer(gl);
  const colorBuffer = initColorBuffer(gl);
  return {
    position: positionBuffer,
    color: colorBuffer,
  }
}


/**
 * 初始化位置缓冲区
 * @param gl 
 * @returns 
 */
function initPositionBuffer(gl: WebGLRenderingContext) {

  const positionBuffer = gl.createBuffer();
  if (positionBuffer === null) {
    console.error("Unable to create position buffer");
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 2个三角形，6个面，每一个面4个点  
  const positions = [
    // 前面 (z = 1.0)
    -1.0, -1.0, 1.0,  // 左下
    1.0, -1.0, 1.0,  // 右下
    1.0, 1.0, 1.0,  // 右上

    // 后面 (z = -1.0)
    -1.0, -1.0, -1.0,  // 左下
    1.0, -1.0, -1.0,  // 右下
    1.0, 1.0, -1.0,  // 右上
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positionBuffer;
}

function initColorBuffer(gl: WebGLRenderingContext) {
  const colorBuffer = gl.createBuffer();
  if (colorBuffer === null) {
    console.error("Unable to create color buffer");
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // 为每个顶点添加 RGB 颜色
  const faceColors = [
    // red
    [1.0, 0.0, 0.0, 1.0], // Back face: red
    [1.0, 0.0, 0.0, 1.0], // Back face: red
    [1.0, 0.0, 0.0, 1.0], // Back face: red

    // green
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [0.0, 1.0, 0.0, 1.0], // Top face: green
  ];
  let colors: number[] = [];
  for (let i = 0; i < faceColors.length; i++) {
    const c = faceColors[i];
    colors = colors.concat(c, c, c, c);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  return colorBuffer;
}