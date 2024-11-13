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
    u_ModelViewMatrix: WebGLUniformLocation | null;
  };
}

function main() {
  const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl");
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }


  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 将顶点坐标 x 世界坐标转化矩阵 x 投影矩阵
  const vsSource = `
attribute vec4 a_Position;
attribute vec4 a_Color; // 新增颜色
uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;
varying vec4 v_Color; // 用来传递颜色的varying变量
void main() {
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Position;
  v_Color = a_Color;
}
  `;

  // 设置fragment shader, 全白色
  const fsSource = `

    varying lowp vec4 v_Color; // varying用于在顶点着色器和片段着色器之间传递数据
    void main() {
    // gl_FragColor = vec4(0.0, 0.0, 1.0, 0.5); // 半透明蓝色
    gl_FragColor = v_Color; // 使用varying变量
    }
  `;

  const shaderProgram = initShader(gl, vsSource, fsSource);
  if (shaderProgram === null) {
    alert(
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
      u_ProjectionMatrix: gl.getUniformLocation(shaderProgram, "u_ProjectionMatrix"),
      u_ModelViewMatrix: gl.getUniformLocation(shaderProgram, "u_ModelViewMatrix"),
    },
  };

  const buffers = initBuffers(gl)

  drawScreen(gl, programInfo, buffers)

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
    alert("Unable to create shader program");
    return null;
  }
  if (!vertexShader || !fragmentShader) {
    return null;
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
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
    alert("Unable to create loader shader");
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
main();