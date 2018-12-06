import {
  assign
} from 'polly-ui'

const SHIP = 50
const ASTEROID_LARGE = 50
const BULLET = 5
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

const addAsteroids = (
  state$,
  cx = screen.bounds.width / 2,
  cy = screen.bounds.height / 2,
  min = 200,
  range = 300,
  size = ASTEROID_LARGE
) => {
  state$.assign("asteroids", state$.get().asteroids.concat(Array.from({ length : 5 }).map(() => {
    const length = Math.random() * min + range
    const position = Math.random() * 2 * Math.PI
    const velocity = Math.random() * 2 * Math.PI
    return {
      image : Math.floor(Math.random() * 4),
      vr : Math.random() * Math.PI - Math.PI / 2,
      vx : Math.sin(velocity) * 100,
      vy : Math.cos(velocity) * 100,
      x : Math.sin(position) * length + cx,
      y : Math.cos(position) * length + cy,
      rotation : Math.random() * 2 * Math.PI,
      width : size,
      height : size
    }
  })))
}

export default {
  scale : 1,
  ship : {
    width : SHIP,
    height : SHIP,
    x : 0,
    y : 0,
    rotation : 0,
    cooldown : 0
  },
  asteroids : [],
  bullets : [],
  isPlaying : false
}

const moveObjects = (state$, screen, ms) => {
  const { scale, asteroids, bullets, ship } = state$.get()
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
  state$.assign("bullets", bullets.map(bullet => {
    return Object.assign({}, bullet, wrap(screen, {
      width : bullet.width * scale,
      height : bullet.height * scale
    }, {
      x : bullet.x + bullet.vx * ms / 1000,
      y : bullet.y + bullet.vy * ms / 1000
    }), {
      rotation : bullet.rotation,
      ttl : bullet.ttl - ms
    })
  }).filter(it => it.ttl > 0))
  state$.assign("ship", "cooldown", ship.cooldown - ms)
}

const getCollision = (scale, lista, listb) => {
  return lista.reduce((collision, itema) => {
    const a = {
      cx : itema.x + itema.width / 2 * scale,
      cy : itema.y + itema.height / 2 * scale,
      radius : itema.width / 2 * scale
    }
    return collision || listb.reduce((collision, itemb) => {
      if(!collision) {
        const b = {
          cx : itemb.x + itemb.width / 2 * scale,
          cy : itemb.y + itemb.height / 2 * scale,
          radius : itemb.width / 2 * scale
        }
        const dx = a.cx - b.cx
        const dy = a.cy - b.cy
        if(Math.sqrt((dx * dx) + (dy * dy)) <= a.radius + b.radius) {
          return [itema, itemb]
        }
      }
      return collision
    }, null)
  }, null)

}

const detectCollisions = (state$, screen, ms) => {
  let collision
  do {
    const { scale, asteroids, bullets, ship } = state$.get()
    collision = getCollision(scale, bullets, asteroids)
    if(collision) {
      const bullet = collision[0]
      const asteroid = collision[1]
      state$.assign("bullets", bullets.filter(it => it !== bullet))
      state$.assign("asteroids", asteroids.filter(it => it !== asteroid))
      if(asteroid.width * 4 > ASTEROID_LARGE) {
        addAsteroids(
          state$,
          asteroid.x + asteroid.width / 2 * scale, //cx
          asteroid.y + asteroid.height / 2 * scale, //cy
          0, //min
          asteroid.width / 2 * scale, //range
          asteroid.width / 2 //size
        )
      }
    }
  } while(collision)
}

export const update = (state$, screen, ms) => {
  moveObjects(state$, screen, ms)
  detectCollisions(state$, screen, ms)
}

export const moveForward = (state$, screen, ms) => {
  const { ship : props, scale } = state$.get()
  state$.assign("ship", Object.assign({}, props, wrap(screen, {
    width : props.width * scale,
    height : props.height * scale
  }, {
    x : props.x + Math.sin(props.rotation) * SPEED * ms / 1000,
    y : props.y - Math.cos(props.rotation) * SPEED * ms / 1000
  })))
}

export const moveBackward = (state$, screen, ms) => {
  const { ship : props, scale } = state$.get()
  state$.assign("ship", Object.assign({}, props, wrap(screen, {
    width : props.width * scale,
    height : props.height * scale
  }, {
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
  state$.assign("ship", "rotation", 0)
  state$.assign("bullets", [])
  state$.assign("asteroids", [])
  addAsteroids(state$, screen.bounds.width / 2, screen.bounds.height / 2)
}

export const shoot = (state$) => {
  const { ship, scale } = state$.get()
  if(ship.cooldown <= 0) {
    const dx = Math.sin(ship.rotation)
    const dy = -Math.cos(ship.rotation)
    state$.assign("ship", "cooldown", 300)
    state$.push("bullets", {
      x : ship.x + ship.width / 2 * scale + ship.width / 2 * scale * dx,
      y : ship.y + ship.height / 2 * scale + ship.height / 2 * scale * dy,
      rotation : Math.PI,
      width : BULLET,
      height : BULLET,
      vx : dx * SPEED * 5,
      vy : dy * SPEED * 5,
      ttl : 300
    })
  }
}
