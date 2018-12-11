import {
  assign
} from 'polly-ui'

const WIDTH = 640
const HEIGHT = 480

const ASTEROID_COUNT = 3
const ASTEROID_SIZES = 3
const ASTEROID_LARGE = 64
const SHIP = 50
const BULLET = ASTEROID_LARGE / Math.pow(2, ASTEROID_SIZES)
const SPEED = 300

const UPGRADES = {
  weapons : {
    back : false, //done
    sides : false, //done
    //big : false, //done
    //fast : false, //done
    //HOMING MISSILE
    //DISTANCE
  },
  movement : {
    back : false, //done
    friction : false, //done
    //phase : false, //done
    //fast : false //done
    //"light speed"
  },
  defense : {
    shield : false, //done
    armor : false, //done
    //orbital : false,
    //bounce : false
    //smaller
  }
}

const LEFT = 200

const getBounds = screen => ({
  width : WIDTH,
  height : HEIGHT
})

const wrap = (screen, view, props) => {
  const bounds = getBounds(screen)
  let { x, y } = props
  if(x < -view.width) {
    x = bounds.width
  }
  if(x > bounds.width) {
    x = -view.width
  }
  if(y < -view.height) {
    y = bounds.height
  }
  if(y > bounds.height) {
    y = -view.height
  }
  return {
    x,
    y
  }
}

const addAsteroids = (
  state$,
  cx,
  cy,
  min = 200,
  range = 50,
  size = ASTEROID_LARGE
) => {
  state$.assign("asteroids", state$.get().asteroids.concat(Array.from({ length : ASTEROID_COUNT }).map(() => {
    const length = min + Math.random() * range
    const position = Math.random() * 2 * Math.PI
    const velocity = Math.random() * 2 * Math.PI
    return {
      image : Math.floor(Math.random() * 4),
      vr : Math.random() * Math.PI - Math.PI / 2,
      vx : Math.sin(velocity) * 100,
      vy : Math.cos(velocity) * 100,
      x : Math.sin(position) * length + cx - size / 2,
      y : Math.cos(position) * length + cy - size / 2,
      rotation : Math.random() * 2 * Math.PI,
      width : size,
      height : size
    }
  })))
}

export default {
  ship : {
    shield : 0,
    health : 100,
    width : SHIP,
    height : SHIP,
    x : 0,
    y : 0,
    rotation : 0,
    cooldown : 0,
    vx : 0,
    vy : 0
  },
  upgrades : UPGRADES,
  asteroids : [],
  bullets : []
}

const moveObjects = (state$, screen, ms) => {
  const { asteroids, bullets, ship, upgrades } = state$.get()
  state$.assign("asteroids", asteroids.map(asteroid => {
    return Object.assign({}, asteroid, wrap(screen, {
      width : asteroid.width,
      height : asteroid.height
    }, {
      x : asteroid.x + asteroid.vx * ms / 1000,
      y : asteroid.y + asteroid.vy * ms / 1000
    }), {
      rotation : asteroid.rotation + asteroid.vr * ms / 1000
    })
  }))
  state$.assign("bullets", bullets.map(bullet => {
    return Object.assign({}, bullet, wrap(screen, {
      width : bullet.width,
      height : bullet.height
    }, {
      x : bullet.x + bullet.vx * ms / 1000,
      y : bullet.y + bullet.vy * ms / 1000
    }), {
      rotation : bullet.rotation,
      ttl : bullet.ttl - ms
    })
  }).filter(it => it.ttl > 0))
  state$.assign("ship", Object.assign({}, ship, wrap(screen, {
    width : ship.width,
    height : ship.height
  }, {
    x : ship.x + ship.vx * ms / 1000,
    y : ship.y + ship.vy * ms / 1000
  }), {
    cooldown : ship.cooldown - ms,
    vx : ship.vx * Math.pow(upgrades.movement.friction ? 0 : .9, ms / 1000),
    vy : ship.vy * Math.pow(upgrades.movement.friction ? 0 : .9, ms / 1000)
  }))
}

const getCollision = (lista, listb) => {
  return lista.reduce((collision, itema) => {
    const a = {
      cx : itema.x + itema.width / 2,
      cy : itema.y + itema.height / 2,
      radius : itema.width / 2
    }
    return collision || listb.reduce((collision, itemb) => {
      if(!collision) {
        const b = {
          cx : itemb.x + itemb.width / 2,
          cy : itemb.y + itemb.height / 2,
          radius : itemb.width / 2
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

const detectAsteroidBulletCollisions = (state$, screen, ms) => {
  let collision
  do {
    const { asteroids, bullets, ship } = state$.get()
    collision = getCollision(bullets, asteroids)
    if(collision) {
      const bullet = collision[0]
      const asteroid = collision[1]
      state$.assign("bullets", bullets.filter(it => it !== bullet))
      state$.assign("asteroids", asteroids.filter(it => it !== asteroid))
      if(asteroid.width * Math.pow(2, ASTEROID_SIZES - 1) > ASTEROID_LARGE) {
        addAsteroids(
          state$,
          asteroid.x + asteroid.width / 2, //cx
          asteroid.y + asteroid.height / 2, //cy
          0, //min
          asteroid.width / 2, //range
          asteroid.width / 2 //size
        )
      }
    }
  } while(collision)
}

const detectAsteroidShipCollisions = (state$, screen, ms) => {
  let collision
  do {
    const { asteroids, bullets, ship, upgrades } = state$.get()
    collision = getCollision([ship], asteroids)
    if(collision) {
      const ship = collision[0]
      const asteroid = collision[1]
      state$.assign("asteroids", asteroids.filter(it => it !== asteroid))
      const damage = upgrades.defense.armor ? 3 : 5
      if(upgrades.defense.shield && ship.shield) {
        state$.assign("ship", "shield", Math.max(ship.shield - damage, 0))
      }
      if(ship.shield - damage <= 0) {
        const rem = ship.health - (damage - ship.shield)
        if(rem > 0) {
          state$.assign("ship", "health", rem)
        } else {
          restart(state$, screen)
        }
      }

      if(!upgrades.movement.friction) {
        const dx = ship.x - asteroid.x
        const dy = ship.y - asteroid.y
        state$.assign("ship", "vx", ship.vx + dx)
        state$.assign("ship", "vy", ship.vy + dy)
      }

      if(asteroid.width * Math.pow(2, ASTEROID_SIZES - 1) > ASTEROID_LARGE) {
        addAsteroids(
          state$,
          asteroid.x + asteroid.width / 2, //cx
          asteroid.y + asteroid.height / 2, //cy
          0, //min
          asteroid.width / 2, //range
          asteroid.width / 2 //size
        )
      }
    }
  } while(collision)
}

const detectCollisions = (state$, screen, ms) => {
  detectAsteroidBulletCollisions(state$, screen, ms)
  detectAsteroidShipCollisions(state$, screen, ms)
}

export const update = (state$, screen, ms) => {
  moveObjects(state$, screen, ms)
  detectCollisions(state$, screen, ms)
  const { upgrades, ship } = state$.get()
  if(upgrades.defense.shield) {
    state$.assign("ship", "shield", Math.min(ship.shield + ms / 1000, 3))
  }
}

export const moveForward = (state$, screen, ms) => {
  const { ship, upgrades } = state$.get()
  const speed = (upgrades.movement.friction ? SPEED * 1000 / 60 : SPEED)
  state$.assign("ship", "vx", ship.vx + Math.sin(ship.rotation) * speed * ms / 1000)
  state$.assign("ship", "vy", ship.vy - Math.cos(ship.rotation) * speed * ms / 1000)
}

export const moveBackward = (state$, screen, ms) => {
  const { ship, upgrades } = state$.get()
  if(upgrades.movement.back) {
    const speed = (upgrades.movement.friction ? SPEED * 1000 / 60 : SPEED)
    state$.assign("ship", "vx", ship.vx - Math.sin(ship.rotation) * speed * ms / 1000)
    state$.assign("ship", "vy", ship.vy + Math.cos(ship.rotation) * speed * ms / 1000)
  }
}

export const turnLeft = (state$, ms) => {
  const {ship, upgrades} = state$.get()
  state$.assign("ship", "rotation", ship.rotation - 1 / 90 * SPEED * ms / 1000)
}

export const turnRight = (state$, ms) => {
  const {ship, upgrades} = state$.get()
  state$.assign("ship", "rotation", ship.rotation + 1 / 90 * SPEED * ms / 1000)
}
const zeroOut = (state$, screen) => {
  state$.assign("ship", "x", getBounds(screen).width / 2 - SHIP / 2)
  state$.assign("ship", "y", getBounds(screen).height / 2 - SHIP / 2)
  state$.assign("ship", "vx", 0)
  state$.assign("ship", "vy", 0)
  state$.assign("ship", "health", 100)
  state$.assign("ship", "shield", 0)
  state$.assign("ship", "rotation", 0)
  state$.assign("bullets", [])
  state$.assign("asteroids", [])
}

export const start = (state$, screen) => {
  zeroOut(state$, screen)
  addAsteroids(state$, getBounds(screen).width / 2, getBounds(screen).height / 2)
}

export const restart = (state$, screen) => {
  zeroOut(state$, screen)
}

const generateBullet = (state$, theta) => {
  const { ship, upgrades } = state$.get()
  const size = BULLET
  const dx = Math.sin(theta)
  const dy = -Math.cos(theta)
  state$.push("bullets", {
    x : ship.x + ship.width / 2 + ship.width / 2 * dx - size / 2,
    y : ship.y + ship.height / 2 + ship.height / 2 * dy - size / 2,
    rotation : Math.PI,
    width : size,
    height : size,
    vx : dx * SPEED * 5,
    vy : dy * SPEED * 5,
    ttl : 300
  })
}

export const shoot = (state$) => {
  const { ship, upgrades } = state$.get()
  if(ship.cooldown <= 0) {
    state$.assign("ship", "cooldown", 600)
    generateBullet(state$, ship.rotation)
    if(upgrades.weapons.back) {
      generateBullet(state$, ship.rotation + Math.PI)
    }
    if(upgrades.weapons.sides) {
      generateBullet(state$, ship.rotation + Math.PI / 2)
      generateBullet(state$, ship.rotation - Math.PI / 2)
    }
  }
}
