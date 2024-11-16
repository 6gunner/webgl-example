export type MyBuffers = {
  position: WebGLBuffer | null;
  color: WebGLBuffer | null;
  indices: WebGLBuffer | null;
}

export function initBuffers(gl: WebGLRenderingContext): MyBuffers {
  const positionBuffer = initPositionBuffer(gl);
  const colorBuffer = initColorBuffer(gl);
  const indexBuffer = initIndexBuffer(gl);
  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer
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
    alert("Unable to create position buffer");
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 24个点，6个面，每一个面4个点  
  const positions = [
    // 前面 (z = 1.0)
    -1.0, -1.0, 1.0,  // 左下
    1.0, -1.0, 1.0,  // 右下
    1.0, 1.0, 1.0,  // 右上
    -1.0, 1.0, 1.0,  // 左上

    // 后面 (z = -1.0)
    -1.0, -1.0, -1.0,  // 左下
    -1.0, 1.0, -1.0,  // 左上
    1.0, 1.0, -1.0,  // 右上
    1.0, -1.0, -1.0,  // 右下

    // 顶面 (y = 1.0)
    -1.0, 1.0, -1.0,  // 左后
    -1.0, 1.0, 1.0,  // 左前
    1.0, 1.0, 1.0,  // 右前
    1.0, 1.0, -1.0,  // 右后

    // 底面 (y = -1.0)
    -1.0, -1.0, -1.0,  // 左后
    1.0, -1.0, -1.0,  // 右后
    1.0, -1.0, 1.0,  // 右前
    -1.0, -1.0, 1.0,  // 左前

    // 右面 (x = 1.0)
    1.0, -1.0, -1.0,  // 右后下
    1.0, 1.0, -1.0,  // 右后上
    1.0, 1.0, 1.0,  // 右前上
    1.0, -1.0, 1.0,  // 右前下

    // 左面 (x = -1.0)
    -1.0, -1.0, -1.0,  // 左后下
    -1.0, -1.0, 1.0,  // 左前下
    -1.0, 1.0, 1.0,  // 左前上
    -1.0, 1.0, -1.0,  // 左后上
  ];


  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positionBuffer;
}

function initColorBuffer(gl: WebGLRenderingContext) {
  const colorBuffer = gl.createBuffer();
  if (colorBuffer === null) {
    alert("Unable to create color buffer");
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // 为每个顶点添加 RGB 颜色
  const faceColors = [
    [1.0, 1.0, 1.0, 1.0], // Front face: white
    [1.0, 0.0, 0.0, 1.0], // Back face: red
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
    [1.0, 1.0, 0.0, 1.0], // Right face: yellow
    [1.0, 0.0, 1.0, 1.0], // Left face: purple
  ];
  let colors: number[] = [];
  for (let i = 0; i < faceColors.length; i++) {
    const c = faceColors[i];
    colors = colors.concat(c, c, c, c);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  return colorBuffer;
}

// 每一个面有2个三角形，每个三角形有3个顶点，这里指定他们的索引
function initIndexBuffer(gl: WebGLRenderingContext) {
  const indexBuffer = gl.createBuffer();
  if (indexBuffer === null) {
    alert("Unable to create index buffer");
    return null;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  const indices = [
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    8, 9, 10, 8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23, // left
  ]
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  return indexBuffer;
}