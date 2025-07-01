// pixelate.frag
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution;

void main() {
  float pixelSize = 10.0;
  float dx = pixelSize / resolution.x;
  float dy = pixelSize / resolution.y;
  vec2 coord = vec2(
    dx * floor(vTexCoord.x / dx),
    dy * floor(vTexCoord.y / dy)
  );
  gl_FragColor = texture2D(tex0, coord);
}