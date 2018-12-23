import { Opcodes } from './Opcodes'
import { Display } from './Display'
import { Audio } from './Audio'
import { Utils } from './Utils'

export class Processor {
  constructor () {
    this.registerSet = new Uint8Array(16)
    this.refreshRate = 16
    this.delayRegister = 0
    this.soundRegister = 0
    this.pc = 0
    this.sp = 0
    this.i = 0
    this.stack = new Uint16Array(16)
    this.memory = new Uint8Array(4096)
    this.vram = new Uint8Array(64 * 32)
    this.keyboardBuffer = new Uint8Array(16)
    this.programLoaded = false
    this.drawFlag = false
    this.interval = null
  }

  updateTimers () {
    if (this.delayRegister > 0) {
      this.delayRegister--
    }

    if (this.soundRegister > 0) {
      this.soundRegister--
    }

    if (this.soundRegister === 1) {
      Audio.beep()
    }
  }

  reset () {
    this.pc = 0x200
    this.clearVram()
    this.i = 0
    this.stack = this.stack.map(() => 0)
    this.sp = 0
    this.registerSet = this.registerSet.map(() => 0)
    this.memory = this.memory.map(() => 0)
    Display.getFontset().map((val, idx) => this.memory[idx] = Display.getFontset()[idx])
    this.keyboardBuffer = this.keyboardBuffer.map(() => 0)
    this.drawFlag = false
    this.delayRegister = 0
    this.soundRegister = 0

    if (this.interval != null) {
      clearInterval(this.interval)
    }

    this.interval = setInterval(this.updateTimers.bind(this), this.refreshRate)
  }

  clearVram () {
    this.vram = this.vram.map(() => 0)
  }

  loadProgram (filename) {
    let reader = new FileReader()

    reader.addEventListener('loadend', () => {
      let buffer = new Uint8Array(reader.result)
      this.loadProgramBuffer(buffer)
    })

    reader.readAsArrayBuffer(filename)
  }

  loadProgramBuffer (buffer) {
    buffer.map((val, idx) => this.memory[idx + 512] = buffer[idx])
    this.pc = 512
    this.programLoaded = true
  }

  exec (processor, opcode) {
    return {
      '0x0000': (processor, opcode) => {
        return {
          '0x0000': Opcodes.clearScreen,
          '0x000E': Opcodes.ret
        }[Utils.convertToHexStr(opcode & 0x000F)]
      },
      '0x1000': Opcodes.jumpToAddress,
      '0x2000': Opcodes.callFunction,
      '0x3000': Opcodes.skipNextInstructionVxEqNn,
      '0x4000': Opcodes.skipNextInstructionVxNeqNn,
      '0x5000': Opcodes.skipNextInstructionVxEqVy,
      '0x6000': Opcodes.setRegisterVxToNn,
      '0x7000': Opcodes.addNnToVx,
      '0x8000': (processor, opcode) => {
        return {
          '0x0000': Opcodes.setVxToVy,
          '0x0001': Opcodes.setVxToVxOrVy,
          '0x0002': Opcodes.setVxToVxAndVy,
          '0x0003': Opcodes.setVxToVxXorVy,
          '0x0004': Opcodes.addVyToVx,
          '0x0005': Opcodes.substractVyFromVx,
          '0x0006': Opcodes.shiftVxRight,
          '0x0007': Opcodes.setVxToVyMinusVx,
          '0x000E': Opcodes.shiftVxLeft,
        }[Utils.convertToHexStr(opcode & 0x000F)]
      },
      '0x9000': Opcodes.skipNextInstructionVxNeqVy,
      '0xA000': Opcodes.setIToAddress,
      '0xB000': Opcodes.jumpToAddressPlusV0,
      '0xC000': Opcodes.setVxToRandomAndNn,
      '0xD000': Opcodes.drawSprite,
      '0xF000': (processor, opcode) => {
        return {
          '0x0007': Opcodes.setVxToDelayRegister,
          '0x000A': Opcodes.waitKeyPressAndStoreInVx,
          '0x0015': Opcodes.setDelayRegisterToVx,
          '0x0018': Opcodes.setSoundRegisterToVx,
          '0x001E': Opcodes.addVxToI,
          '0x0029': Opcodes.setIToLocationOfSpriteFromVx,
          '0x0033': Opcodes.storeBcdOfVxAtI,
          '0x0055': Opcodes.storeV0ToVxInMemoryStartingAtI,
          '0x0065': Opcodes.fillV0ToVxWithValuesFromMemoryAtI
        }[Utils.convertToHexStr(opcode & 0x00FF)]
      },
      '0xE000': (processor, opcode) => {
        return {
          '0x009E': Opcodes.skipNextInstructionIfTheKeyStoredInVxIsPressed,
          '0x00A1': Opcodes.skipNextInstructionIfTheKeyStoredInVxIsNotPressed
        }[Utils.convertToHexStr(opcode & 0x00FF)]
      }
    }[Utils.convertToHexStr(opcode & 0xF000)]
  }

  runCycle () {
    let opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1]
    let op = this.exec(this, opcode)

    while (op !== undefined) {
      op = op(this, opcode)
    }
  }
}
