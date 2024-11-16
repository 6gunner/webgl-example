export type MyBuffers = {
  position: WebGLBuffer | null;
  indices: WebGLBuffer | null;
  textureCoord: WebGLBuffer | null;
}

export function initBuffers(gl: WebGLRenderingContext): MyBuffers {
  const positionBuffer = initPositionBuffer(gl);
  const indexBuffer = initIndexBuffer(gl);
  const textureCoordBuffer = initTextureBuffer(gl);

  return {
    position: positionBuffer,
    indices: indexBuffer,
    textureCoord: textureCoordBuffer
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


function initTextureBuffer(gl: WebGLRenderingContext) {
  const textureBuffer = gl.createBuffer();
  if (textureBuffer === null) {
    alert("Unable to create texture buffer");
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  const textureCoord = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoord), gl.STATIC_DRAW);
  return textureBuffer;
}