import { Processor } from './Processor'
import { Display } from './Display'
import { Keyboard } from './Keyboard'

let processor = new Processor()
let display = new Display(processor)
let keyboard = new Keyboard(processor)

window.onload = () => {
  let fileInput = document.getElementById('fileInput')

  fileInput.addEventListener('change', function (e) {
    document.querySelector('.upload').style.opacity = '0'

    let file = fileInput.files[0]
    processor.reset()
    processor.loadProgram(file)
  })
}

document.onkeyup = document.onkeydown = keyboard.onKey.bind(keyboard)

setInterval(() => {
  if (processor.programLoaded === true) {
    for (let i = 0; i < 8; i++) {
      processor.runCycle()
    }
  }
}, 16)

setInterval(() => {
  if (processor.programLoaded === true) {
    display.render()
  }
}, 16)
