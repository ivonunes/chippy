export class Utils {
  static convertToHexStr (opcode) {
    let tempStr = (opcode).toString(16).toUpperCase()
    let addln = 4 - tempStr.length
    let pad = ''

    for (let i = 0; i < addln; i++) {
      pad = pad + '0'
    }

    return '0x' + pad + tempStr
  }
}
