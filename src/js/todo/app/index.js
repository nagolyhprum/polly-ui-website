export default screen => {
  const {
    container,
    background,
    MATCH,
    WRAP,
    text,
    textColor,
    padding,
    margin,
    weight,
    linear,
    card,
    scrollable,
    fab,
    onClick,
    resources : {
      drawable,
      string,
      color
    }
  } = screen
  linear()
  container(MATCH, WRAP, () => {
    background(color.background.primary)
    padding(16)
    container(WRAP, WRAP, () => {
      text(string.title)
      textColor(color.icons)
    })
  })
  container(MATCH, 0, () => {
    padding(16)
    linear(16)
    weight(1)
    background(color.background.light)
    scrollable()
    for(let i = 0; i < 10; i++) {
      container(MATCH, WRAP, () => {
        onClick(() => {
          console.log(i)
        })
        padding(16)
        linear(8)
        card()
        container(WRAP, WRAP, () => {
          text("TODO")
          textColor(color.text.primary)
        })
        container(WRAP, WRAP, () => {
          text("Date")
          textColor(color.text.secondary)
        })
        container(WRAP, WRAP, () => {
          text("Tag")
          textColor(color.text.secondary)
        })
      })
    }
  })
  container(40, 40, () => {
    //fab()
  })
}
