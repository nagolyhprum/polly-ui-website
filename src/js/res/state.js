import {
  assign
} from 'polly-ui'

const SHIP = 50
const ASTEROID_LARGE = 50
const SPEED = 300

const wrap = (screen, view, props) => {
  let { x, y } = props
  if(x < -view.width) {
    x = screen.width
  }
  if(x > screen.width) {
    x = - view.width
  }
  if(y < -view.height) {
    y = screen.height
  }
  if(y > screen.height) {
    y = - view.height
  }
  return {
    x,
    y
  }
}

const addAsteroids = (state$, screen) => {
  state$.assign("asteroids", Array.from({ length : 5 }).map(() => {
    const length = Math.random() * 200 + 300
    const position = Math.random() * 2 * Math.PI
    const velocity = Math.random() * 2 * Math.PI
    return {
      image : Math.floor(Math.random() * 4),
      vr : Math.random() * Math.PI - Math.PI / 2,
      vx : Math.sin(velocity) * 100,
      vy : Math.cos(velocity) * 100,
      x : Math.sin(position) * length + screen.bounds.width / 2,
      y : Math.cos(position) * length + screen.bounds.height / 2,
      rotation : Math.random() * 2 * Math.PI,
      width : ASTEROID_LARGE,
      height : ASTEROID_LARGE
    }
  }))
}

export default {
  scale : 1,
  ship : {
    width : SHIP,
    height : SHIP,
    x : 0,
    y : 0,
    rotation : 0
  },
  asteroids : [],
  isPlaying : false
}

export const moveAsteroids = (state$, screen, ms) => {
  const { scale, asteroids } = state$.get()
  state$.assign("asteroids", asteroids.map(asteroid => {
    return Object.assign({}, asteroid, wrap(screen, {
      width : asteroid.width * scale,
      height : asteroid.height * scale
    }, {
      x : asteroid.x + asteroid.vx * ms / 1000,
      y : asteroid.y + asteroid.vy * ms / 1000
    }), {
      rotation : asteroid.rotation + asteroid.vr * ms / 1000
    })
  }))
}

export const moveForward = (state$, screen, view, ms) => {
  const { ship : props } = state$.get()
  state$.assign("ship", Object.assign({}, props, wrap(screen, view, {
    x : props.x + Math.sin(props.rotation) * SPEED * ms / 1000,
    y : props.y - Math.cos(props.rotation) * SPEED * ms / 1000
  })))
}

export const moveBackward = (state$, screen, view, ms) => {
  const { ship : props } = state$.get()
  state$.assign("ship", Object.assign({}, props, wrap(screen, view, {
    x : props.x - Math.sin(props.rotation) * SPEED * ms / 1000,
    y : props.y + Math.cos(props.rotation) * SPEED * ms / 1000
  })))
}

export const turnLeft = (state$, ms) => state$.assign("ship", "rotation", state$.get().ship.rotation - 1 / 90 * SPEED * ms / 1000)

export const turnRight = (state$, ms) => state$.assign("ship", "rotation", state$.get().ship.rotation + 1 / 90 * SPEED * ms / 1000)

export const start = (state$, screen) => {
  state$.assign("isPlaying", true)
  state$.assign("ship", "x", screen.bounds.width / 2 - SHIP / 2)
  state$.assign("ship", "y", screen.bounds.height / 2 - SHIP / 2)
  addAsteroids(state$, screen)
}
