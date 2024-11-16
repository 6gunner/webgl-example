import { mat4 } from "gl-matrix";
import type { ProgramInfo } from "./webgl-demo";
import type { MyBuffers } from "./init-buffers";
export function drawScreen(gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: MyBuffers, texture: WebGLTexture, cubeRotation: number) {

  gl.clearColor(0, 0, 0, 1.0);
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
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6]); // 将矩阵平移到 z 轴负方向 6 个单位。
  mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1]); // 将矩阵绕 z 轴旋转 squareRotation 弧度
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.7, // amount to rotate in radians
    [0, 1, 0],
  ); // axis to rotate around (Y)
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.3, // amount to rotate in radians
    [1, 0, 0],
  ); // axis to rotate around (X)
  // 法线矩阵
  const normalMatrix = mat4.create();
  //1. 计算模型视图矩阵的逆矩阵
  mat4.invert(normalMatrix, modelViewMatrix);
  //2. 将逆矩阵转置
  mat4.transpose(normalMatrix, normalMatrix);


  // 设置位置属性、颜色和法线等属性
  setPositionAttribute(gl, programInfo, buffers);
  setTextureAttribute(gl, programInfo, buffers);
  setNormalAttribute(gl, programInfo, buffers);
  gl.useProgram(programInfo.program);


  // 设置shader的uniform变量
  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ModelViewMatrix, false, modelViewMatrix);
  // 使用逆转置矩阵，确保法线仍然垂直于变形后的表面
  gl.uniformMatrix4fv(programInfo.uniformLocations.u_NormalMatrix, false, normalMatrix);

  // 设置纹理
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // 告诉着色器使用哪个纹理
  gl.uniform1i(programInfo.uniformLocations.u_Sampler, 0);

  // 顶点数量  6*6
  const vertexCount = 36;
  // 无符号短整型
  const type = gl.UNSIGNED_SHORT;
  const offset = 0;
  // 绘制
  gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);



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

function setTextureAttribute(gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: MyBuffers) {
  const numComponents = 2; // 每一个纹理坐标有2个值
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
  gl.vertexAttribPointer(
    programInfo.attribLocations.a_TextureCoord,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.a_TextureCoord);
}

// 法线
function setNormalAttribute(gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: MyBuffers) {
  const numComponents = 3; // 每个法线有3个值
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
  gl.vertexAttribPointer(programInfo.attribLocations.a_Normal, numComponents, type, normalize, stride, offset);
  gl.enableVertexAttribArray(programInfo.attribLocations.a_Normal);
}