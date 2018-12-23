export class Keyboard {
  constructor (processor) {
    this.processor = processor
  }

  onKey (event) {
    let charStr = String.fromCharCode(event.which)
    let value = (event.type === 'keydown') ? 1 : 0

    const idx = {
      '1': 0x1,
      '2': 0x2,
      '3': 0x3,
      '4': 0x4,
      'Q': 0x4,
      'W': 0x5,
      'E': 0x6,
      'R': 0xD,
      'A': 0x7,
      'S': 0x8,
      'D': 0x9,
      'F': 0xE,
      'Z': 0xA,
      'X': 0x0,
      'C': 0xB,
      'V': 0xF
    }[charStr]

    if (idx !== undefined) {
      this.processor.keyboardBuffer[idx] = value
    }
  }
}
