// invert.frag
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D tex0;

void main() {
  vec4 color = texture2D(tex0, vTexCoord);
  gl_FragColor = vec4(1.0 - color.rgb, color.a);
}