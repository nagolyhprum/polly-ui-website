import { update, moveForward, moveBackward, turnLeft, turnRight, start, shoot } from "../res/state"

//https://opengameart.org/content/space-shooter-ship-and-items
import ShipImg from "../images/ship.png"
import Bullet from '../images/bullet.png'
import Asteroid1 from '../images/asteroid1.png'
import Asteroid2 from '../images/asteroid2.png'
import Asteroid3 from '../images/asteroid3.png'
import Asteroid4 from '../images/asteroid4.png'
const Asteroids = [
  Asteroid1,
  Asteroid2,
  Asteroid3,
  Asteroid4
]

export default screen => {
  const {
    background,
    container,
    fps,
    anchor,
    position,
    textColor,
    list,
    state$,
    adapter,
    MATCH,
    onRender,
    setDirty,
    onClick,
    canvas,
    onKeyPressed
  } = screen
  state$.assign("scale", canvas.getRatio())
  onClick(() => {
    start(state$, screen)
  })
  onRender(ms => {
    update(state$, screen.bounds, ms)
    setDirty()
  })
  background("white")
  ship(screen)
  container(MATCH, MATCH, () => {
    adapter(state$.prop("asteroids"), asteroid, false)
  })
  container(MATCH, MATCH, () => {
    adapter(state$.prop("bullets"), bullet, false)
  })
  fps()
  onKeyPressed({
    up : ms => {
      moveForward(state$, screen.bounds, ms)
    },
    right : ms => {
      turnRight(state$, ms)
    },
    down : ms => {
      moveBackward(state$, screen.bounds, ms)
    },
    left : ms => {
      turnLeft(state$, ms)
    },
    space : ms => {
      shoot(state$)
    }
  })
}

const bullet = (screen, bullet) => {
  const {
    container,
    background,
    position,
    anchor,
    state$,
    text,
    velocity,
    WRAP,
    src
  } = screen
  container(bullet.width, bullet.height, view => {
    //background("blue")
    src(Bullet, "trim")
    view.x = bullet.x
    view.y = bullet.y
    view.rotation = bullet.rotation
  })
}

const asteroid = (screen, asteroid) => {
  const {
    container,
    background,
    position,
    anchor,
    state$,
    text,
    velocity,
    WRAP,
    src
  } = screen
  container(asteroid.width, asteroid.height, view => {
    //background("blue")
    src(Asteroids[asteroid.image], "trim")
    view.x = asteroid.x
    view.y = asteroid.y
    view.rotation = asteroid.rotation
  })
}

const ship = screen => {
  const {
    container,
    background,
    anchor,
    position,
    state$,
    observe,
    onKeyPressed,
    PERCENT,
    visibility,
    text,
    src
  } = screen
  const { ship } = state$.get()
  container(ship.width, ship.height, view => {
    //background("blue")
    observe(state$.prop("isPlaying"), visibility)
    src(ShipImg, "trim")
    observe(state$.prop("ship"), pos => {
      view.x = pos.x
      view.y = pos.y
      view.rotation = pos.rotation
    })
  })
}
