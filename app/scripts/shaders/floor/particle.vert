
uniform float tick;
uniform float repeat;
uniform float noiseScale;
uniform float timeScale;
uniform float pointSizeScale;

attribute float pointSize;
attribute vec3 color;

varying vec2 vUv;
varying vec3 vColor;
varying vec4 buffer;
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
void main() {

	vUv = uv * repeat;
	vColor = color;
	float noise = snoise2(vec2(vUv.x, vUv.y + (tick * timeScale))) * noiseScale;
	vec3 newPosition = position;
	newPosition.z += noise;
	gl_PointSize = pointSize * pointSizeScale;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

}
