export type MyBuffers = {
  position: WebGLBuffer | null;
  color: WebGLBuffer | null;
}

export function initBuffers(gl: WebGLRenderingContext): MyBuffers {
  const positionBuffer = initPositionBuffer(gl);
  const colorBuffer = initColorBuffer(gl);
  return {
    position: positionBuffer,
    color: colorBuffer
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

  // 在 WebGL 中，坐标系统是标准化的，范围从 - 1 到 1：

  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

  // 一个只占视口一半大小的正方形
  // const positions = [
  //   0.5, 0.5,    // 右上
  //   -0.5, 0.5,    // 左上
  //   0.5, -0.5,    // 右下
  //   -0.5, -0.5     // 左下
  // ];


  // 另一种常见的顺序
  // const positions = [
  //   -1.0, -1.0,    // 左下
  //   -1.0, 1.0,    // 左上
  //   1.0, -1.0,    // 右下
  //   1.0, 1.0     // 右上
  // ];


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
  const pastelColors = [
    1.0, 0.8, 0.8, 1.0,    // 淡红色
    0.8, 1.0, 0.8, 1.0,    // 淡绿色
    0.8, 0.8, 1.0, 1.0,    // 淡蓝色
    1.0, 1.0, 0.8, 1.0,    // 淡黄色
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pastelColors), gl.STATIC_DRAW);
  return colorBuffer;
}
