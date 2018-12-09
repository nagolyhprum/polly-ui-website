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
    WRAP,
    observe,
    text,
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
    canvas,
    onKeyPressed,
    clip,
    margin
  } = screen
  onRender(ms => {
    update(state$, screen, ms)
    setDirty()
  })
  background("black")
  container(MATCH, MATCH, view => {
    margin(0, 0, 0, 200)
    background("red")
    ship(screen)
    container(MATCH, MATCH, () => {
      adapter(state$.prop("asteroids"), asteroid, false)
    })
    container(MATCH, MATCH, () => {
      adapter(state$.prop("bullets"), bullet, false)
    })
    upgrades(screen)
    clip()
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
  container(WRAP, WRAP, () => {
    textColor("white")
    observe(state$.prop("ship", "health"), text)
  })
  container(WRAP, WRAP, view => {
    view.y = 100
    textColor("white")
    observe(state$.prop("ship", "shield"), text)
  })
}

const upgrades = screen => {

  const upgrades = [[{
    name : "Side Guns",
    category : "weapons",
    subcategory : "sides"
  }, {
    name : "Rear Gun",
    category : "weapons",
    subcategory : "back"
  }], [{
    name : "Front Thruster",
    category : "movement",
    subcategory : "back"
  }, {
    name : "Friction",
    category : "movement",
    subcategory : "friction"
  }], [{
    name : "Shield",
    category : "defense",
    subcategory : "shield"
  }, {
    name : "Armor Plating",
    category : "defense",
    subcategory : "armor"
  }]]

  const  {
    MATCH,
    container,
    background,
    onClick,
    state$,
    visibility,
    observe,
    linear,
    weight,
    margin,
    padding,
    text,
    isEnabled,
    textColor
  } = screen
  container(MATCH, MATCH, () => {
    linear(16)
    background("green")
    observe(state$.prop("asteroids"), asteroids => {
      visibility(!asteroids.length)
    })
    padding(16)
    upgrades.forEach(types => {
      container(MATCH, 0, () => {
        linear(16, 'horizontal')
        weight(1)
        types.forEach(upgrade => {
          container(0, MATCH, () => {
            weight(1)
            background("blue")
            text(upgrade.name)
            textColor("white")
            observe(state$.prop("upgrades"), upgrades => {
              isEnabled(!upgrades[upgrade.category][upgrade.subcategory])
            })
            onClick(() => {
              state$.assign("upgrades", upgrade.category, upgrade.subcategory, true)
              start(state$, screen)
            })
          })
        })
      })
    })
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
    // background("blue")
    observe(state$.prop("isPlaying"), visibility)
    src(ShipImg, "trim")
    observe(state$.prop("ship"), pos => {
      view.x = pos.x
      view.y = pos.y
      view.rotation = pos.rotation
    })
  })
}
