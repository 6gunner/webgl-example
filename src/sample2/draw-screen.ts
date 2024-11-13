import { mat4 } from "gl-matrix";
import type { ProgramInfo } from "./webgl-demo-2";
import type { MyBuffers } from "./init-buffers";
export function drawScreen(gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: MyBuffers) {

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 创建一个投影矩阵 perspective matrix
  const fieldOfView = 45 * Math.PI / 180; // 视角fov（45in radians）
  const aspect = gl.canvas.width / gl.canvas.height; // 宽高比
  const zNear = 1; // 近平面距离
  const zFar = 2000; // 远平面距离
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);


  // 创建转化矩阵 ？？
  const modelViewMatrix = mat4.create(); // 创建一个新的 4x4 矩阵，初始化为单位矩阵（identity matrix）
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]); // 将矩阵平移到 z 轴负方向 6 个单位

  // 设置位置属性和颜色属性
  setPositionAttribute(gl, programInfo, buffers);
  setColorAttribute(gl, programInfo, buffers);
  gl.useProgram(programInfo.program);


  // 设置shader的uniform变量
  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ModelViewMatrix, false, modelViewMatrix);

  // 当使用 gl.TRIANGLE_STRIP 绘制模式时：
  // 第一个三角形：顶点 1,2,3
  // 第二个三角形：顶点 2,3,4
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

}

function setPositionAttribute(gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: MyBuffers) {
  const numComponents = 2; // 每个位置有2个值（x,y）
  const type = gl.FLOAT; // 每个值的类型
  const normalize = false; // 不需要标准化
  const stride = 0; // 0 = 移动距离 * 每个顶点字节大小
  const offset = 0; // 从缓冲区开始位置

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(programInfo.attribLocations.a_Position, numComponents, type, normalize, stride, offset);
  gl.enableVertexAttribArray(programInfo.attribLocations.a_Position);

}

// into the vertexColor attribute.
function setColorAttribute(gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: MyBuffers) {
  const numComponents = 4; // 每个颜色有4个值（R,G,B,A）
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.a_Color,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.a_Color);
}