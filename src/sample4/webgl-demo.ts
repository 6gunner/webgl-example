import textureImage from '@/assets/texture.jpg'

import { drawScreen } from "./draw-screen";
import { initBuffers } from "./init-buffers";

export type ProgramInfo = {
  program: WebGLProgram;
  attribLocations: {
    a_Position: number;
    a_TextureCoord: number;
  };
  uniformLocations: {
    u_ProjectionMatrix: WebGLUniformLocation | null;
    u_ModelViewMatrix: WebGLUniformLocation | null;
    u_Sampler: WebGLUniformLocation | null;
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
  // Set clear color to white, fully opaque
  gl.clearColor(1, 1, 1, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 将顶点坐标 x 世界坐标转化矩阵 x 投影矩阵
  const vsSource = `
attribute vec4 a_Position;
attribute vec2 a_TextureCoord; // 纹理坐标
uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;
varying highp vec2 v_TextureCoord; // 用来传递textureCoord的varying变量
void main() {
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Position;
  v_TextureCoord = a_TextureCoord;
}
  `;

  // 设置fragment shader, 全白色
  const fsSource = `
    varying highp vec2 v_TextureCoord; // varying用于在顶点着色器和片段着色器之间传递数据
    uniform sampler2D u_Sampler; // 纹理

    void main() {
      gl_FragColor = texture2D(u_Sampler, v_TextureCoord);
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
      a_TextureCoord: gl.getAttribLocation(shaderProgram, "a_TextureCoord"),
    },
    uniformLocations: {
      u_ProjectionMatrix: gl.getUniformLocation(shaderProgram, "u_ProjectionMatrix"),
      u_ModelViewMatrix: gl.getUniformLocation(shaderProgram, "u_ModelViewMatrix"),
      u_Sampler: gl.getUniformLocation(shaderProgram, "u_Sampler"),

    },
  };

  const buffers = initBuffers(gl)
  const texture = loadTexture(gl);
  // 翻转y轴
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

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

    drawScreen(gl, programInfo, buffers, texture, cubeRotation);
    cubeRotation = cubeRotation + deltaTime; // 每秒旋转0.5度
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




function loadTexture(gl: WebGLRenderingContext) {
  const texture = gl.createTexture();
  if (texture === null) {
    alert("Unable to create texture");
    return null;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);


  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // 蓝色
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
    // 在 WebGL1 中，对于非 2 的幂次方（non - power - of - 2，简称 NPOT）纹理有特殊限制
    // 如果图片的宽高是2的幂，则生成多级渐远纹理
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // 这里再干嘛？
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    }
  }
  image.src = textureImage;
  return texture;
}

function isPowerOf2(value: number) {
  return (value & (value - 1)) === 0;
}

main();
