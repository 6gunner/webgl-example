import videoSource from '@/assets/bg.mp4'
import { drawScreen } from "./draw-screen";
import { initBuffers } from "./init-buffers";

let copyVideo = false;

export type ProgramInfo = {
  program: WebGLProgram;
  attribLocations: {
    a_Position: number;
    a_TextureCoord: number;
    a_Normal: number;// 法线
  };
  uniformLocations: {
    u_ProjectionMatrix: WebGLUniformLocation | null;
    u_ModelViewMatrix: WebGLUniformLocation | null;
    u_Sampler: WebGLUniformLocation | null;
    u_NormalMatrix: WebGLUniformLocation | null;
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
  gl.clearColor(0, 0, 0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 将顶点坐标 x 世界坐标转化矩阵 x 投影矩阵
  const vsSource = `
attribute vec4 a_Position;
attribute vec2 a_TextureCoord; // 纹理坐标
attribute vec3 a_Normal; // 原始法线

uniform mat4 u_ModelViewMatrix; 
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_NormalMatrix; // 法线变换矩阵
varying highp vec2 v_TextureCoord; // 用来传递textureCoord的varying变量
varying highp vec3 v_Lighting; // 用来传递光照的varying变量
void main() {
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Position;
  v_TextureCoord = a_TextureCoord;
   // 即使在阴影处也能看到的基础亮度
  highp vec3 ambientLight = vec3(0.1,0.1,0.1);
  // 平行光颜色 - 日落色
  highp vec3 directionalLightColor =  vec3(1.0, 0.8, 0.6);
  // 平行光方向 
  highp vec3 directionalLightDirection = normalize(vec3(1.0, 1.0, 1.0));
  // 转化法线，为什么要转化？如果物体旋转了45度，法线也要跟着旋转45度
  highp vec4 transformedNormal = u_NormalMatrix * vec4(a_Normal, 1.0);
  // 计算光照向量 光照点乘法线，最小为0
  highp float directionalLightWeighting = max(dot(transformedNormal.xyz, directionalLightDirection), 0.0);
  // 光照强度 = 环境光 + 漫反射光
  v_Lighting = ambientLight + (directionalLightColor * directionalLightWeighting);
}
  `;

  // 设置fragment shader
  const fsSource = `
    varying highp vec2 v_TextureCoord; // varying用于在顶点着色器和片段着色器之间传递数据
    varying highp vec3 v_Lighting; // 用来传递光照的varying变量

    uniform sampler2D u_Sampler; // 纹理

    void main() {
      highp vec4 textureColor = texture2D(u_Sampler, v_TextureCoord);
      gl_FragColor = vec4(textureColor.rgb * v_Lighting,  textureColor.a);
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
      a_Normal: gl.getAttribLocation(shaderProgram, "a_Normal"),
    },
    uniformLocations: {
      u_ProjectionMatrix: gl.getUniformLocation(shaderProgram, "u_ProjectionMatrix"),
      u_ModelViewMatrix: gl.getUniformLocation(shaderProgram, "u_ModelViewMatrix"),
      u_Sampler: gl.getUniformLocation(shaderProgram, "u_Sampler"),
      u_NormalMatrix: gl.getUniformLocation(shaderProgram, "u_NormalMatrix"),
    },
  };

  const buffers = initBuffers(gl)
  const texture = loadTexture(gl);
  const video = setUpVideo();
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

    if (copyVideo) {
      updateTexture(gl, texture, video);
    }
    drawScreen(gl, programInfo, buffers, texture, cubeRotation);
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

  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  return texture;
}

function updateTexture(gl: WebGLRenderingContext, texture: WebGLTexture, video: HTMLVideoElement) {
  const level = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video);
}

function setUpVideo() {
  let playing = false;
  let timeupdate = false;

  const video = document.createElement("video");
  video.addEventListener('playing', () => {
    playing = true;
    checkReady();
  });

  video.addEventListener('timeupdate', () => {
    timeupdate = true;
    checkReady();
  });


  video.src = videoSource;
  video.loop = true;
  video.muted = true;
  video.play();

  function checkReady() {
    if (playing && timeupdate) {
      copyVideo = true;
    }
  }
  return video;
}


main();
