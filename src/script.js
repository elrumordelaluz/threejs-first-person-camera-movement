import './style.css'
import * as THREE from 'three'
import { RollerCoasterGeometry } from 'three/examples/jsm/misc/RollerCoaster.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
let mesh, material, geometry

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.xr.enabled = true
renderer.xr.setReferenceSpaceType('local')
document.body.appendChild(renderer.domElement)

document.body.appendChild(VRButton.createButton(renderer))

//

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xf0f0ff)

const light = new THREE.HemisphereLight(0xfff0f0, 0x606066)
light.position.set(1, 1, 1)
scene.add(light)

const train = new THREE.Object3D()
scene.add(train)

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  500
)

train.add(camera)

const PI2 = Math.PI * 2

const curve = (function () {
  const vector = new THREE.Vector3()
  const vector2 = new THREE.Vector3()

  return {
    getPointAt: function (t) {
      t = t * PI2

      const x = Math.sin(t * 3) * Math.cos(t * 4) * 50
      const y = Math.sin(t * 10) * 2 + Math.cos(t * 17) * 2 + 5
      const z = Math.sin(t) * Math.sin(t * 4) * 50

      return vector.set(x, y, z).multiplyScalar(2)
    },

    getTangentAt: function (t) {
      const delta = 0.0001
      const t1 = Math.max(0, t - delta)
      const t2 = Math.min(1, t + delta)

      return vector2
        .copy(this.getPointAt(t2))
        .sub(this.getPointAt(t1))
        .normalize()
    },
  }
})()

geometry = new RollerCoasterGeometry(curve, 1500)
material = new THREE.MeshPhongMaterial()
mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

//

window.addEventListener('resize', onWindowResize)

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

//

const position = new THREE.Vector3()
const tangent = new THREE.Vector3()

const lookAt = new THREE.Vector3()

let velocity = 0
let progress = 0

let prevTime = performance.now()

function render() {
  const time = performance.now()
  const delta = time - prevTime

  progress += velocity
  // progress = progress % 1

  position.copy(curve.getPointAt(progress))
  position.y += 0.3

  train.position.copy(position)

  tangent.copy(curve.getTangentAt(progress))

  velocity -= tangent.y * 0.0000001 * delta
  velocity = Math.max(0.00004, Math.min(0.0002, velocity))

  train.lookAt(lookAt.copy(position).sub(tangent))

  renderer.render(scene, camera)

  prevTime = time
}

renderer.setAnimationLoop(render)
