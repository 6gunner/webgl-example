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
}

main();