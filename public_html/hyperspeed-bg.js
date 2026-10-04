/**
 * Hyperspeed 3D Warp Background Engine for The Capital Box
 * Uses Three.js WebGL procedural distortion & light streaks
 */
(function () {
  'use strict';

  function initHyperspeed() {
    if (typeof THREE === 'undefined') return;

    let container = document.getElementById('hyperspeed-bg');
    if (!container) {
      container = document.createElement('div');
      container.id = 'hyperspeed-bg';
      document.body.prepend(container);
    }

    if (container._hyperspeedInit) return;
    container._hyperspeedInit = true;

    const options = {
      distortion: 'turbulentDistortion',
      length: 400,
      roadWidth: 10,
      islandWidth: 2,
      lanesPerRoad: 4,
      fov: 90,
      fovSpeedUp: 150,
      speedUp: 2,
      carLightsFade: 0.4,
      totalSideLightSticks: 25,
      lightPairsPerRoadWay: 45,
      shoulderLinesWidthPercentage: 0.05,
      brokenLinesWidthPercentage: 0.1,
      brokenLinesLengthPercentage: 0.5,
      lightStickWidth: [0.12, 0.5],
      lightStickHeight: [1.3, 1.7],
      movingAwaySpeed: [60, 80],
      movingCloserSpeed: [-120, -160],
      carLightsLength: [400 * 0.03, 400 * 0.2],
      carLightsRadius: [0.05, 0.14],
      carWidthPercentage: [0.3, 0.5],
      carShiftX: [-0.8, 0.8],
      carFloorSeparation: [0, 5],
      colors: {
        roadColor: 0x050811,
        islandColor: 0x0a0f1d,
        background: 0x070b14,
        shoulderLines: 0xf2ca50,
        brokenLines: 0xd4af37,
        leftCars: [0xf2ca50, 0xd4af37, 0xffe088], // Gold & Amber left lights
        rightCars: [0x06b6d4, 0x4edea3, 0x0ea5e9], // Cyan & Emerald right lights
        sticks: 0xf2ca50
      }
    };

    const turbulentUniforms = {
      uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
      uAmp: { value: new THREE.Vector4(25, 5, 10, 10) }
    };

    const nsin = val => Math.sin(val) * 0.5 + 0.5;

    const distortionConfig = {
      uniforms: turbulentUniforms,
      getDistortion: `
        uniform vec4 uFreq;
        uniform vec4 uAmp;
        float nsin(float val){
          return sin(val) * 0.5 + 0.5;
        }
        #define PI 3.14159265358979
        float getDistortionX(float progress){
          return (
            cos(PI * progress * uFreq.r + uTime) * uAmp.r +
            pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2. ) * uAmp.g
          );
        }
        float getDistortionY(float progress){
          return (
            -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
            -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
          );
        }
        vec3 getDistortion(float progress){
          return vec3(
            getDistortionX(progress) - getDistortionX(0.0125),
            getDistortionY(progress) - getDistortionY(0.0125),
            0.
          );
        }
      `,
      getJS: (progress, time) => {
        const uFreq = turbulentUniforms.uFreq.value;
        const uAmp = turbulentUniforms.uAmp.value;

        const getX = p =>
          Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x +
          Math.pow(Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)), 2) * uAmp.y;

        const getY = p =>
          -nsin(Math.PI * p * uFreq.z + time) * uAmp.z -
          Math.pow(nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)), 5) * uAmp.w;

        let distortion = new THREE.Vector3(
          getX(progress) - getX(progress + 0.007),
          getY(progress) - getY(progress + 0.007),
          0
        );
        let lookAtAmp = new THREE.Vector3(-2, -5, 0);
        let lookAtOffset = new THREE.Vector3(0, 0, -10);
        return distortion.multiply(lookAtAmp).add(lookAtOffset);
      }
    };

    options.distortion = distortionConfig;

    class App {
      constructor(container, options) {
        this.options = options;
        this.container = container;
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(options.fov, width / height, 0.1, 10000);
        this.camera.position.set(0, 8, -5);

        this.scene = new THREE.Scene();
        let fog = new THREE.Fog(options.colors.background, options.length * 0.2, options.length * 50);
        this.scene.fog = fog;
        this.fogUniforms = {
          fogColor: { value: fog.color },
          fogNear: { value: fog.near },
          fogFar: { value: fog.far }
        };

        this.clock = new THREE.Clock();
        this.road = new Road(this, options);
        this.leftCarLights = new CarLights(this, options, options.colors.leftCars, options.movingAwaySpeed, new THREE.Vector2(0, 1 - options.carLightsFade));
        this.rightCarLights = new CarLights(this, options, options.colors.rightCars, options.movingCloserSpeed, new THREE.Vector2(1, 0 + options.carLightsFade));
        this.leftSticks = new LightsSticks(this, options);

        this.speedUp = 0;
        this.timeOffset = 0;

        this.init();
      }

      init() {
        this.road.init();
        this.leftCarLights.init();
        this.leftCarLights.mesh.position.setX(-this.options.roadWidth / 2 - this.options.islandWidth / 2);

        this.rightCarLights.init();
        this.rightCarLights.mesh.position.setX(this.options.roadWidth / 2 + this.options.islandWidth / 2);

        this.leftSticks.init();
        this.leftSticks.mesh.position.setX(-(this.options.roadWidth + this.options.islandWidth / 2));

        window.addEventListener('resize', () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          this.renderer.setSize(w, h, false);
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
        });

        const tick = () => {
          requestAnimationFrame(tick);
          const delta = this.clock.getDelta();
          this.timeOffset += delta * 1.5;
          const time = this.clock.getElapsedTime() + this.timeOffset;

          this.rightCarLights.update(time);
          this.leftCarLights.update(time);
          this.leftSticks.update(time);
          this.road.update(time);

          if (this.options.distortion.getJS) {
            const distortion = this.options.distortion.getJS(0.025, time);
            this.camera.lookAt(
              new THREE.Vector3(
                this.camera.position.x + distortion.x,
                this.camera.position.y + distortion.y,
                this.camera.position.z + distortion.z
              )
            );
          }
          this.renderer.render(this.scene, this.camera);
        };
        tick();
      }
    }

    const random = base => (Array.isArray(base) ? Math.random() * (base[1] - base[0]) + base[0] : Math.random() * base);
    const pickRandom = arr => (Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr);

    class CarLights {
      constructor(webgl, options, colors, speed, fade) {
        this.webgl = webgl;
        this.options = options;
        this.colors = colors;
        this.speed = speed;
        this.fade = fade;
      }

      init() {
        const options = this.options;
        let curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1));
        let geometry = new THREE.TubeGeometry(curve, 40, 1, 8, false);
        let instanced = new THREE.InstancedBufferGeometry().copy(geometry);
        instanced.instanceCount = options.lightPairsPerRoadWay * 2;

        let laneWidth = options.roadWidth / options.lanesPerRoad;
        let aOffset = [], aMetrics = [], aColor = [];
        let colors = Array.isArray(this.colors) ? this.colors.map(c => new THREE.Color(c)) : new THREE.Color(this.colors);

        for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
          let radius = random(options.carLightsRadius);
          let length = random(options.carLightsLength);
          let speed = random(this.speed);
          let carLane = i % options.lanesPerRoad;
          let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2;
          let carWidth = random(options.carWidthPercentage) * laneWidth;
          laneX += random(options.carShiftX) * laneWidth;

          let offsetY = random(options.carFloorSeparation) + radius * 1.3;
          let offsetZ = -random(options.length);

          aOffset.push(laneX - carWidth / 2, offsetY, offsetZ);
          aOffset.push(laneX + carWidth / 2, offsetY, offsetZ);

          aMetrics.push(radius, length, speed);
          aMetrics.push(radius, length, speed);

          let color = pickRandom(colors);
          aColor.push(color.r, color.g, color.b);
          aColor.push(color.r, color.g, color.b);
        }

        instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3));
        instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3));
        instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3));

        const material = new THREE.ShaderMaterial({
          fragmentShader: `
            varying vec3 vColor;
            varying vec2 vUv;
            uniform vec2 uFade;
            void main() {
              float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
              gl_FragColor = vec4(vColor, alpha);
            }
          `,
          vertexShader: `
            attribute vec3 aOffset;
            attribute vec3 aMetrics;
            attribute vec3 aColor;
            uniform float uTravelLength;
            uniform float uTime;
            varying vec2 vUv;
            varying vec3 vColor;
            ${options.distortion.getDistortion}
            void main() {
              vec3 transformed = position.xyz;
              float radius = aMetrics.r;
              float myLength = aMetrics.g;
              float speed = aMetrics.b;
              transformed.xy *= radius;
              transformed.z *= myLength;
              transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);
              transformed.xy += aOffset.xy;
              float progress = abs(transformed.z / uTravelLength);
              transformed.xyz += getDistortion(progress);
              vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
              gl_Position = projectionMatrix * mvPosition;
              vUv = uv;
              vColor = aColor;
            }
          `,
          transparent: true,
          uniforms: Object.assign({
            uTime: { value: 0 },
            uTravelLength: { value: options.length },
            uFade: { value: this.fade }
          }, options.distortion.uniforms)
        });

        let mesh = new THREE.Mesh(instanced, material);
        mesh.frustumCulled = false;
        this.webgl.scene.add(mesh);
        this.mesh = mesh;
      }

      update(time) {
        if (this.mesh) this.mesh.material.uniforms.uTime.value = time;
      }
    }

    class LightsSticks {
      constructor(webgl, options) {
        this.webgl = webgl;
        this.options = options;
      }

      init() {
        const options = this.options;
        const geometry = new THREE.PlaneGeometry(1, 1);
        let instanced = new THREE.InstancedBufferGeometry().copy(geometry);
        let totalSticks = options.totalSideLightSticks;
        instanced.instanceCount = totalSticks;

        let stickoffset = options.length / (totalSticks - 1);
        const aOffset = [], aColor = [], aMetrics = [];
        let colors = Array.isArray(options.colors.sticks) ? options.colors.sticks.map(c => new THREE.Color(c)) : new THREE.Color(options.colors.sticks);

        for (let i = 0; i < totalSticks; i++) {
          let width = random(options.lightStickWidth);
          let height = random(options.lightStickHeight);
          aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());
          let color = pickRandom(colors);
          aColor.push(color.r, color.g, color.b);
          aMetrics.push(width, height);
        }

        instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1));
        instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3));
        instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2));

        const material = new THREE.ShaderMaterial({
          fragmentShader: `
            varying vec3 vColor;
            void main(){ gl_FragColor = vec4(vColor, 0.85); }
          `,
          vertexShader: `
            attribute float aOffset;
            attribute vec3 aColor;
            attribute vec2 aMetrics;
            uniform float uTravelLength;
            uniform float uTime;
            varying vec3 vColor;
            mat4 rotationY(in float angle) {
              return mat4(cos(angle),0,sin(angle),0, 0,1,0,0, -sin(angle),0,cos(angle),0, 0,0,0,1);
            }
            ${options.distortion.getDistortion}
            void main(){
              vec3 transformed = position.xyz;
              transformed.xy *= aMetrics;
              float time = mod(uTime * 60. * 2. + aOffset, uTravelLength);
              transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;
              transformed.z += - uTravelLength + time;
              float progress = abs(transformed.z / uTravelLength);
              transformed.xyz += getDistortion(progress);
              vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
              gl_Position = projectionMatrix * mvPosition;
              vColor = aColor;
            }
          `,
          side: THREE.DoubleSide,
          transparent: true,
          uniforms: Object.assign({ uTravelLength: { value: options.length }, uTime: { value: 0 } }, options.distortion.uniforms)
        });

        const mesh = new THREE.Mesh(instanced, material);
        mesh.frustumCulled = false;
        this.webgl.scene.add(mesh);
        this.mesh = mesh;
      }

      update(time) {
        if (this.mesh) this.mesh.material.uniforms.uTime.value = time;
      }
    }

    class Road {
      constructor(webgl, options) {
        this.webgl = webgl;
        this.options = options;
        this.uTime = { value: 0 };
      }

      createPlane(side, width, isRoad) {
        const options = this.options;
        const geometry = new THREE.PlaneGeometry(isRoad ? options.roadWidth : options.islandWidth, options.length, 20, 100);
        const material = new THREE.ShaderMaterial({
          fragmentShader: `
            varying vec2 vUv;
            uniform vec3 uColor;
            uniform float uTime;
            void main() {
              gl_FragColor = vec4(uColor, 0.4);
            }
          `,
          vertexShader: `
            uniform float uTravelLength;
            uniform float uTime;
            varying vec2 vUv;
            ${options.distortion.getDistortion}
            void main() {
              vec3 transformed = position.xyz;
              vec3 distortion = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
              transformed.x += distortion.x;
              transformed.z += distortion.y;
              transformed.y += -1. * distortion.z;
              vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
              gl_Position = projectionMatrix * mvPosition;
              vUv = uv;
            }
          `,
          side: THREE.DoubleSide,
          transparent: true,
          uniforms: Object.assign({
            uTravelLength: { value: options.length },
            uColor: { value: new THREE.Color(isRoad ? options.colors.roadColor : options.colors.islandColor) },
            uTime: this.uTime
          }, options.distortion.uniforms)
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.z = -options.length / 2;
        mesh.position.x += (options.islandWidth / 2 + options.roadWidth / 2) * side;
        this.webgl.scene.add(mesh);
        return mesh;
      }

      init() {
        this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true);
        this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true);
        this.island = this.createPlane(0, this.options.islandWidth, false);
      }

      update(time) {
        this.uTime.value = time;
      }
    }

    new App(container, options);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHyperspeed);
  } else {
    initHyperspeed();
  }
})();
