export class Opcodes {
  static clearScreen (processor, opcode) {
    processor.clearVram()
    processor.drawFlag = true
    processor.pc += 2
  }

  static ret (processor, opcode) {
    --processor.sp
    processor.pc = processor.stack[processor.sp]
    processor.pc += 2
  }

  static jumpToAddress (processor, opcode) {
    processor.pc = opcode & 0x0FFF
  }

  static callFunction (processor, opcode) {
    processor.stack[processor.sp] = processor.pc
    ++processor.sp
    processor.pc = opcode & 0x0FFF
  }

  static skipNextInstructionVxEqNn (processor, opcode) {
    if (processor.registerSet[(opcode & 0x0F00) >> 8] === (opcode & 0x00FF)) {
      processor.pc += 4
    } else {
      processor.pc += 2
    }
  }

  static skipNextInstructionVxNeqNn (processor, opcode) {
    if (processor.registerSet[(opcode & 0x0F00) >> 8] !== (opcode & 0x00FF)) {
      processor.pc += 4
    } else {
      processor.pc += 2
    }
  }

  static skipNextInstructionVxEqVy (processor, opcode) {
    if (processor.registerSet[(opcode & 0x0F00) >> 8] === processor.registerSet[(opcode & 0x00F0) >> 4]) {
      processor.pc += 4
    } else {
      processor.pc += 2
    }
  }

  static setRegisterVxToNn (processor, opcode) {
    processor.registerSet[(opcode & 0x0F00) >> 8] = opcode & 0x00FF
    processor.pc += 2
  }

  static addNnToVx (processor, opcode) {
    processor.registerSet[(opcode & 0x0F00) >> 8] += opcode & 0x00FF
    processor.pc += 2
  }

  static setVxToVy (processor, opcode) {
    processor.registerSet[(opcode & 0x0F00) >> 8] = processor.registerSet[(opcode & 0x00F0) >> 4]
    processor.pc += 2
  }

  static setVxToVxOrVy (processor, opcode) {
    processor.registerSet[(opcode & 0x0F00) >> 8] |= processor.registerSet[(opcode & 0x00F0) >> 4]
    processor.pc += 2
  }

  static setVxToVxAndVy (processor, opcode) {
    processor.registerSet[(opcode & 0x0F00) >> 8] &= processor.registerSet[(opcode & 0x00F0) >> 4]
    processor.pc += 2
  }

  static setVxToVxXorVy (processor, opcode) {
    processor.registerSet[(opcode & 0x0F00) >> 8] ^= processor.registerSet[(opcode & 0x00F0) >> 4]
    processor.pc += 2
  }

  static addVyToVx (processor, opcode) {
    if (processor.registerSet[(opcode & 0x00F0) >> 4] > (0xFF - processor.registerSet[(opcode & 0x0F00) >> 8])) {
      processor.registerSet[0xF] = 1
    } else {
      processor.registerSet[0xF] = 0
    }

    processor.registerSet[(opcode & 0x0F00) >> 8] += processor.registerSet[(opcode & 0x00F0) >> 4]
    processor.pc += 2
  }

  static substractVyFromVx (processor, opcode) {
    if (processor.registerSet[(opcode & 0x00F0) >> 4] > processor.registerSet[(opcode & 0x0F00) >> 8]) {
      processor.registerSet[0xF] = 0
    } else {
      processor.registerSet[0xF] = 1
    }

    processor.registerSet[(opcode & 0x0F00) >> 8] -= processor.registerSet[(opcode & 0x00F0) >> 4]
    processor.pc += 2
  }

  static shiftVxRight (processor, opcode) {
    processor.registerSet[0xF] = processor.registerSet[(opcode & 0x0F00) >> 8] & 0x1
    processor.registerSet[(opcode & 0x0F00) >> 8] >>= 1
    processor.pc += 2
  }

  static setVxToVyMinusVx (processor, opcode) {
    if (processor.registerSet[(opcode & 0x0F00) >> 8] > processor.registerSet[(opcode & 0x00F0) >> 4]) {
      processor.registerSet[0xF] = 0
    } else {
      processor.registerSet[0xF] = 1
    }

    processor.registerSet[(opcode & 0x0F00) >> 8] = processor.registerSet[(opcode & 0x00F0) >> 4] - processor.registerSet[(opcode & 0x0F00) >> 8]
    processor.pc += 2
  }

  static shiftVxLeft (processor, opcode) {
    processor.registerSet[0xF] = processor.registerSet[(opcode & 0x0F00) >> 8] >> 7
    processor.registerSet[(opcode & 0x0F00) >> 8] <<= 1
    processor.pc += 2
  }

  static skipNextInstructionVxNeqVy (processor, opcode) {
    if (processor.registerSet[(opcode & 0x0F00) >> 8] !== processor.registerSet[(opcode & 0x00F0) >> 4]) {
      processor.pc += 4
    } else {
      processor.pc += 2
    }
  }

  static setIToAddress (processor, opcode) {
    processor.i = opcode & 0x0FFF
    processor.pc += 2
  }

  static jumpToAddressPlusV0 (processor, opcode) {
    processor.pc = (opcode & 0x0FFF) + processor.registerSet[0]
  }

  static setVxToRandomAndNn (processor, opcode) {
    let regidx = (opcode & 0xF00) >>> 8
    let add = opcode & 0x0FF

    processor.registerSet[regidx] = (Math.random() * 256) & add
    processor.pc += 2
  }

  static drawSprite (processor, opcode) {
    let x = processor.registerSet[(opcode & 0x0F00) >> 8]
    let y = processor.registerSet[(opcode & 0x00F0) >> 4]
    let height = opcode & 0x000F
    let pixel

    processor.registerSet[0xF] = 0

    for (let yline = 0; yline < height; yline++) {
      pixel = processor.memory[processor.i + yline]

      for (let xline = 0; xline < 8; xline++) {
        if ((pixel & (0x80 >> xline)) !== 0) {
          if (processor.vram[(x + xline + ((y + yline) * 64))] === 1) {
            processor.registerSet[0xF] = 1
          }

          processor.vram[x + xline + ((y + yline) * 64)] ^= 1
        }
      }
    }

    processor.drawFlag = true
    processor.pc += 2
  }

  static setVxToDelayRegister (processor, opcode) {
    processor.registerSet[(opcode & 0x0F00) >> 8] = processor.delayRegister
    processor.pc += 2
  }

  static waitKeyPressAndStoreInVx (processor, opcode) {
    let keyPress = false

    for (let i = 0; i < 16; ++i) {
      if (processor.keyboardBuffer[i] !== 0) {
        processor.registerSet[(opcode & 0x0F00) >> 8] = i
        keyPress = true
      }
    }

    if (!keyPress) {
      return
    }

    processor.pc += 2
  }

  static setDelayRegisterToVx (processor, opcode) {
    processor.delayRegister = processor.registerSet[(opcode & 0x0F00) >> 8]
    processor.pc += 2
  }

  static setSoundRegisterToVx (processor, opcode) {
    processor.soundRegister = processor.registerSet[(opcode & 0x0F00) >> 8]
    processor.pc += 2
  }

  static addVxToI (processor, opcode) {
    if (processor.i + processor.registerSet[(opcode & 0x0F00) >> 8] > 0xFFF) {
      processor.registerSet[0xF] = 1
    } else {
      processor.registerSet[0xF] = 0
    }

    processor.i += processor.registerSet[(opcode & 0x0F00) >> 8]
    processor.pc += 2
  }

  static setIToLocationOfSpriteFromVx (processor, opcode) {
    processor.i = processor.registerSet[(opcode & 0x0F00) >> 8] * 0x5
    processor.pc += 2
  }

  static storeBcdOfVxAtI (processor, opcode) {
    processor.memory[processor.i] = processor.registerSet[(opcode & 0x0F00) >> 8] / 100
    processor.memory[processor.i + 1] = (processor.registerSet[(opcode & 0x0F00) >> 8] / 10) % 10
    processor.memory[processor.i + 2] = (processor.registerSet[(opcode & 0x0F00) >> 8] % 100) % 10
    processor.pc += 2
  }

  static storeV0ToVxInMemoryStartingAtI (processor, opcode) {
    for (let i = 0; i <= ((opcode & 0x0F00) >> 8); ++i) {
      processor.memory[processor.i + i] = processor.registerSet[i]
    }

    processor.pc += 2
  }

  static fillV0ToVxWithValuesFromMemoryAtI (processor, opcode) {
    for (let i = 0; i <= ((opcode & 0x0F00) >> 8); ++i) {
      processor.registerSet[i] = processor.memory[processor.i + i]
    }

    processor.pc += 2
  }

  static skipNextInstructionIfTheKeyStoredInVxIsPressed (processor, opcode) {
    if (processor.keyboardBuffer[processor.registerSet[(opcode & 0x0F00) >> 8]] !== 0) {
      processor.pc += 4
    } else {
      processor.pc += 2
    }
  }

  static skipNextInstructionIfTheKeyStoredInVxIsNotPressed (processor, opcode) {
    if (processor.keyboardBuffer[processor.registerSet[(opcode & 0x0F00) >> 8]] === 0) {
      processor.pc += 4
    } else {
      processor.pc += 2
    }
  }
}
