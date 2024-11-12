function main() {
  const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl");
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }
  // 设置清除颜色，但实际上并没有进行任何绘制操作。这就像是"准备好油漆"。
  gl.clearColor(1.0, 0.12, 0.01, 1.0);
  // 清除画布；gl.clear() 才是实际执行清除操作的命令，相当于用之前定义的颜色"粉刷整个画布"。
  gl.clear(gl.COLOR_BUFFER_BIT);



  // 将顶点坐标 x 世界坐标转化矩阵 x 投影矩阵
  const vsSource = `
attribute vec4 a_Position;
uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;
void main() {
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Position;
}
  `;

  // 设置fragment shader, 全白色
  const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

  const shaderProgram = initShader(gl, vsSource, fsSource);
  if (shaderProgram === null) {
    alert(
      "Unable to initShader."
    );
    return;
  }

  // Collect all the info needed to use the shader program.
  // Look up which attribute our shader program is using
  // for aVertexPosition and look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    },
  };


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
    alert("Unable to create shader");
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