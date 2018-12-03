const SPEED = 10

export default screen => {
  const {
    background,
    container
  } = screen
  background("black")
  ship(screen)
}

const wrap = (screen, view, props) => {
  let { x, y, rotation } = props
  if(x < - view.bounds.width / 2 - screen.bounds.width / 2) {
    x = screen.bounds.width / 2 + view.bounds.width / 2
  }
  if(x > screen.bounds.width / 2 + view.bounds.width / 2) {
    x = - view.bounds.width / 2 - screen.bounds.width / 2
  }
  if(y < - view.bounds.height / 2 - screen.bounds.height / 2) {
    y = screen.bounds.height / 2 + view.bounds.height / 2
  }
  if(y > screen.bounds.height / 2 + view.bounds.height / 2) {
    y = - view.bounds.height / 2 - screen.bounds.height / 2
  }
  return {
    x,
    y,
    rotation
  }
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
    PERCENT
  } = screen
  container(50, 50, ship => {
    onKeyPressed({
      up : () => {
        const { ship : props } = state$.get()
        state$.assign("ship", wrap(screen, ship, {
          x : props.x + Math.sin(props.rotation) * SPEED,
          y : props.y - Math.cos(props.rotation) * SPEED,
          rotation  :props.rotation
        }))
      },
      right : () => {
        state$.assign("ship", "rotation", state$.get().ship.rotation + 1 / 90 * SPEED)
      },
      down : () => {
        const { ship : props } = state$.get()
        state$.assign("ship", wrap(screen, ship, {
          x : props.x - Math.sin(props.rotation) * SPEED,
          y : props.y + Math.cos(props.rotation) * SPEED,
          rotation  :props.rotation
        }))
      },
      left : () => {
        state$.assign("ship", "rotation", state$.get().ship.rotation - 1 / 90 * SPEED)
      }
    })
    background("white")
    anchor(.5, .5)
    position(.5, .5)
    observe(state$.prop("ship"), pos => {
      ship.x = pos.x
      ship.y = pos.y
      ship.rotation = pos.rotation
      screen.setDirty()
    })
  })
}
