// 画两个三角形

import { drawScreen } from "./draw-screen";
import { initBuffers } from "./init-buffers";

export type ProgramInfo = {
  program: WebGLProgram;
  attribLocations: {
    a_Position: number;
    a_Color: number;
  };
  uniformLocations: {

    u_ProjectionMatrix: WebGLUniformLocation | null;
    u_ModelMatrix: WebGLUniformLocation | null;
    u_ViewMatrix: WebGLUniformLocation | null;
  };
}



function main() {
  const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl");
  if (gl === null) {
    console.error(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }
  // Set clear color to white, fully opaque
  gl.clearColor(0, 0, 0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 将顶点坐标 x 世界坐标转化矩阵 x 投影矩阵
  const vsSource = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ModelMatrix; // 模型矩阵
uniform mat4 u_ViewMatrix; // 视图矩阵
uniform mat4 u_ProjectionMatrix; // 投影矩阵

varying vec4 v_Color; // 用来传递颜色的varying变量

void main() {
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1);
  v_Color = a_Color;
}
  `;

  // 设置fragment shader
  const fsSource = `
    varying vec4 v_Color; // 用来传递颜色的varying变量
    void main() {
      gl_FragColor = v_Color; // 设置颜色
    }
  `;

  const shaderProgram = initShader(gl, vsSource, fsSource);
  if (shaderProgram === null) {
    console.error(
      "Unable to initShader."
    );
    return;
  }

  // 定义shader program 信息
  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      a_Position: gl.getAttribLocation(shaderProgram, "a_Position"),
      a_Color: gl.getAttribLocation(shaderProgram, "a_Color"),
    },
    uniformLocations: {
      u_ModelMatrix: gl.getUniformLocation(shaderProgram, "u_ModelMatrix"),
      u_ViewMatrix: gl.getUniformLocation(shaderProgram, "u_ViewMatrix"),
      u_ProjectionMatrix: gl.getUniformLocation(shaderProgram, "u_ProjectionMatrix"),
    },
  };

  const buffers = initBuffers(gl)

  // drawScreen(gl, programInfo, buffers, squareRotation);
  let cubeRotation = 0; // 角度
  let deltaTime = 0;
  let then = 0;
  /**
   * 
   * @param now 表示从pageLoad开始到当前的时间，单位为毫秒
   */
  function render(now: number) {
    now *= 0.001; // convert to seconds
    deltaTime = now - then; // 计算时间差
    then = now;
    drawScreen(gl, programInfo, buffers, cubeRotation);
    cubeRotation = cubeRotation + 0.1 * deltaTime; // 每秒旋转0.5度
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

}


/**
 * 初始化shader 
 * Initialize a shader program, so WebGL knows how to draw our data
 * @param gl 
 * @param vsSource 
 * @param fsSource 
 * @returns 
 */
function initShader(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
  const vertexShader = loadShader(gl, vsSource, gl.VERTEX_SHADER);
  const fragmentShader = loadShader(gl, fsSource, gl.FRAGMENT_SHADER);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  if (shaderProgram === null) {
    console.error("Unable to create shader program");
    return null;
  }
  if (!vertexShader || !fragmentShader) {
    return null;
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  debugger
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

/**
 * 创建shader
 * creates a shader of the given type, uploads the source and compiles it.
 * @param gl 
 * @param source 
 * @param type 
 */
function loadShader(gl: WebGLRenderingContext, source: string, type: number) {
  const shader = gl.createShader(type);
  if (shader === null) {
    console.error("Unable to create loader shader");
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

main();
