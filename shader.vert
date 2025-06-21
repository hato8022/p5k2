attribute vec3 aPosition; // (1)

void main() { // (2)
    gl_Position = vec4(aPosition, 1.0); // (3)
}