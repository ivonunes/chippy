export class Audio {
  static beep () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    let context = new window.AudioContext()
    let frequency = 440

    let currentTime = context.currentTime
    let osc = context.createOscillator()
    let gain = context.createGain()

    osc.connect(gain)
    gain.connect(context.destination)

    gain.gain.setValueAtTime(gain.gain.value, currentTime)
    gain.gain.exponentialRampToValueAtTime(0.00001, currentTime + 1)

    osc.onended = function () {
      gain.disconnect(context.destination)
      osc.disconnect(gain)
    }

    osc.type = 'sine'
    osc.frequency.value = frequency
    osc.start(currentTime)
    osc.stop(currentTime + 0.00001)

    context.close()
  }
}
