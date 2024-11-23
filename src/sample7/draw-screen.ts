import { mat4 } from "gl-matrix";
import type { ProgramInfo } from "./app";
import type { MyBuffers } from "./init-buffers";
export function drawScreen(gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: MyBuffers, rotation: number) {

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things
  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 启用多边形偏移
  gl.enable(gl.POLYGON_OFFSET_FILL);

  // 创建一个投影矩阵 perspective matrix
  const fieldOfView = 60 * Math.PI / 180; // 视角fov（45in radians）
  const aspect = gl.canvas.width / gl.canvas.height; // 宽高比
  const zNear = 1; // 近平面距离
  const zFar = 200; // 远平面距离
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);


  // 创建view视图转化矩阵，从z轴6个单位，看向原点，向上为y轴
  const cameraMatrix = mat4.create();
  const eye = [0, 0, 5];
  mat4.lookAt(
    cameraMatrix,
    new Float32Array(eye),// 相机位置
    new Float32Array([0, 0, 0]), // 观察点位 
    new Float32Array([0, 1, 0])); // 向上方向
  // 绕 Y 轴旋转
  mat4.rotate(cameraMatrix, cameraMatrix, rotation, new Float32Array([0, 1, 0]));


  // 创建modal转化矩阵，单位矩阵，不变化
  const modelViewMatrix = mat4.create();

  // 设置位置属性和颜色属性
  setPositionAttribute(gl, programInfo, buffers);
  setColorAttribute(gl, programInfo, buffers);
  gl.useProgram(programInfo.program);


  // 设置shader的uniform变量
  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ViewMatrix, false, cameraMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ModelMatrix, false, modelViewMatrix);

  const vertexCount = 3;
  // 将旋转角度标准化到 0-360 度
  const degrees = (rotation * 180 / Math.PI) % 360;
  // 如果角度为负数，转换为正数
  const normalizedDegrees = degrees < 0 ? degrees + 360 : degrees;
  // 添加 5 度的过渡区域
  const transitionRange = 5;
  // 避开临界点
  if (normalizedDegrees > (90 + transitionRange) &&
    normalizedDegrees < (270 - transitionRange)) {
    // 绿色三角形在前（远离临界点）
    gl.polygonOffset(1.0, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);  // 红色先画
    gl.polygonOffset(0.0, 0.0);
    gl.drawArrays(gl.TRIANGLES, 3, vertexCount);  // 绿色后画
  }
  else if (normalizedDegrees < (90 - transitionRange) ||
    normalizedDegrees > (270 + transitionRange)) {
    // 红色三角形在前（远离临界点）
    gl.polygonOffset(1.0, 1.0);
    gl.drawArrays(gl.TRIANGLES, 3, vertexCount);  // 绿色先画
    gl.polygonOffset(0.0, 0.0);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);  // 红色后画
  }
  else {
    // 在临界点附近，使用较小的偏移值
    gl.polygonOffset(2.0, 2.0);
    gl.drawArrays(gl.TRIANGLES, 3, vertexCount);  // 绿色
    gl.polygonOffset(0.0, 0.0);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);  // 红色
  }


}

function setPositionAttribute(gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: MyBuffers) {
  const numComponents = 3; // 每个位置有3个值（x,y,z）
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
  const numComponents = 4; // 每个颜色有4个值（R,G,B,A）所以每次拿4个
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