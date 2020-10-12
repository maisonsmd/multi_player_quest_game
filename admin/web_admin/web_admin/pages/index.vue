<template>
  <b-container fluid>
    <b-alert
      :show="alert.dismiss_countdown"
      fade
      variant="warning"
      @dismiss-count-down="alert_countdown_changed"
      style="
        max-width: 300px;
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 98;
      "
      >{{ alert.message }}
    </b-alert>

    <b-alert
      variant="danger"
      show
      v-if="!connected"
      fade
      class="text-uppercase font-weight-bold"
      style="
        max-width: 300px;
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 99;
      "
    >
      lost connection!</b-alert
    >

    <div class="w-100">
      <div v-if="has_focus">
        <b-row>
          <b-col sm="4" class="text-white text-uppercase text-left">
            <h1>đội {{ this.team_index + 1 }}</h1>
          </b-col>
          <b-col sm="4" class="text-white text-uppercase text-center">
            <h1>điểm: {{ this.score }}</h1>
          </b-col>
          <b-col sm="4" class="text-white text-right text-monospace">
            <h1 class="text-uppercase text-white">
              {{ this.stopwatch.string }}
            </h1>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="8">
            <b-row>
              <b-input
                autocomplete="off"
                class="text-weight-bold ml-3 mr-3"
                placeholder="Nhập kết quả và nhấn ENTER"
                size="lg"
                ref="answerInput"
                id="answer-input"
                v-model="answer_text"
                @keydown.enter="send_input"
              ></b-input>
            </b-row>
            <b-row align-h="center" class="mt-4">
              <b-col sm="3">
                <b-button
                  class="w-100"
                  :variant="btn_variant.a"
                  @click="send_quick_answer('A')"
                  >A <br />(SHIFT+1)</b-button
                >
              </b-col>
              <b-col sm="3">
                <b-button
                  class="w-100"
                  :variant="btn_variant.b"
                  @click="send_quick_answer('B')"
                  >B <br />(SHIFT+2)</b-button
                >
              </b-col>
              <b-col sm="3">
                <b-button
                  id="answer-c"
                  class="w-100"
                  :variant="btn_variant.c"
                  @click="send_quick_answer('C')"
                  >C <br />(SHIFT+3)</b-button
                >
              </b-col>
              <b-col sm="3">
                <b-button
                  class="w-100"
                  :variant="btn_variant.d"
                  @click="send_quick_answer('D')"
                  >D <br />(SHIFT+4)</b-button
                >
              </b-col>
            </b-row>
          </b-col>
          <b-col sm="4">
            <b-button
              size="lg"
              :variant="btn_variant.quick_take"
              class="h-100 w-100 text-uppercase"
              @click="quick_take"
              >giành quyền trả lời<br />(SHIFT+SPACE)</b-button
            >
          </b-col>
        </b-row>
      </div>
      <div v-else>
        <h1 class="text-uppercase text-white">LOST FOCUS!</h1>
        <h3 class="text-uppercase text-white">click vào đây để trả lời!</h3>
      </div>
    </div>
  </b-container>
</template>

<script>
import io from 'socket.io-client'
import axios from 'axios'

export default {
  name: 'index',
  data() {
    return {
      host: '',
      connected: false,
      socket: null,
      alert: {
        dismiss_countdown: 0,
        message: '',
      },
      stopwatch: {
        running: false,
        start: 0,
        interval_timer: -1,
        string: '0:00.00',
      },
      score: 0,
      answer_text: '',
      team_index: -1,
      has_focus: false,
      btn_variant: {
        a: 'outline-light',
        b: 'outline-light',
        c: 'outline-light',
        d: 'outline-light',
        quick_take: 'outline-light',
      },
      light_trigger_sound: new Audio('light_trigger.mp3'),
    }
  },
  created() {
    this.host = `http://${window.location.hostname}:3001`
    document.title = 'loading'
    this.team_index = +(this.$route.query.team || 0) - 1

    if (this.team_index < 0 || this.team_index >= 6)
      while (true) {
        let input = prompt('số thứ tự của đội? (1-6)')
        input = +input
        if (input >= 1 && input <= 6) {
          this.team_index = input - 1
          document.title = 'ĐỘI ' + input
          this.$router.push({
            path: '#',
            query: { team: this.team_index + 1 },
          })
          break
        }
      }
    document.title = 'ĐỘI ' + (this.team_index + 1)

    this.init_socket()
    document.onkeydown = (e) => {
      if (!(e.shiftKey || e.altKey || e.SHIFTKey)) return

      // if (document.getElementById('answer-input') != document.activeElement)
      if (
        ['1', '2', '3', '4', ' ', '!', '@', '#', '$'].includes(e.key) &&
        e.SHIFTKey
      )
        e.preventDefault()

      switch (e.key) {
        case '1':
        case '!':
          this.send_quick_answer('A')
          this.btn_variant.a = 'light'
          setTimeout(() => (this.btn_variant.a = 'outline-light'), 100)
          break
        case '2':
        case '@':
          this.send_quick_answer('B')
          this.btn_variant.b = 'light'
          setTimeout(() => (this.btn_variant.b = 'outline-light'), 100)
          break
        case '3':
        case '#':
          this.send_quick_answer('C')
          this.btn_variant.c = 'light'
          setTimeout(() => (this.btn_variant.c = 'outline-light'), 100)
          break
        case '4':
        case '$':
          this.send_quick_answer('D')
          this.btn_variant.d = 'light'
          setTimeout(() => (this.btn_variant.d = 'outline-light'), 100)
          break
        case ' ':
          this.quick_take()
          this.btn_variant.quick_take = 'light'
          setTimeout(() => (this.btn_variant.quick_take = 'outline-light'), 100)
          break
      }
    }
    if (document.hasFocus()) this.has_focus = true

    window.onfocus = () => {
      setTimeout(() => (this.has_focus = true), 200)
    }
    window.onblur = () => {
      this.has_focus = false
    }

    this.request_stopwatch()
    axios.get(`${this.host}/players_display`).then((res) => {
      const me = res.data[this.team_index]
      this.score = me.score
    })
  },

  methods: {
    convert_to_time_string(timestamp) {
      let dt = new Date(timestamp)
      let str = dt.toLocaleTimeString().toLowerCase()
      let time = str.substring(
        str.indexOf(':') + (dt.getMinutes() < 10 ? 2 : 1),
        str.length
      )
      let ms = dt.getMilliseconds()
      let ms_str = '' + ms
      if (ms < 10) ms_str = '0' + ms_str
      else ms_str = ms_str.substring(0, 2)
      return time.replace(/ (am|pm)/, '.') + ms_str
    },
    send_quick_answer(ans) {
      if (!this.stopwatch.running) {
        this.show_alert('Chưa được phép trả lời!')
      } else this.show_alert('Đáp án đầu tiên sẽ được ghi nhận!')

      this.socket.emit('answer', {
        team: this.team_index,
        answer: ans,
      })

      this.btn_variant.a = 'outline-light'
      this.btn_variant.b = 'outline-light'
      this.btn_variant.c = 'outline-light'
      this.btn_variant.d = 'outline-light'
    },
    quick_take() {
      this.socket.emit('quick_take', this.team_index)
    },
    send_input() {
      let input = this.answer_text
      if (!this.stopwatch.running) {
        this.show_alert('Chưa được phép trả lời!')
      } else {
        this.show_alert('Đáp án đầu tiên sẽ được ghi nhận!')
        this.answer_text = ''
      }

      if (!input) return
      this.socket.emit('answer', {
        team: this.team_index,
        answer: input,
      })

      this.btn_variant.a = 'outline-light'
      this.btn_variant.b = 'outline-light'
      this.btn_variant.c = 'outline-light'
      this.btn_variant.d = 'outline-light'
    },
    init_socket() {
      this.socket = io.connect(this.host)

      this.socket.on('connect', () => {
        this.connected = true
        console.log('connected')
      })
      this.socket.on('stopwatch_start', (data) => {
        this.stopwatch.start = Date.now()
        this.stopwatch.running = true

        this.btn_variant.a = 'success'
        this.btn_variant.b = 'success'
        this.btn_variant.c = 'success'
        this.btn_variant.d = 'success'
      })
      this.socket.on('stopwatch_stop', (data) => {
        if (!this.stopwatch.running) {
          this.stopwatch.string = this.convert_to_time_string(0)
          return
        }
        this.stopwatch.string = this.convert_to_time_string(data)
        this.stopwatch.running = false
        // this.stopwatch.string = this.convert_to_time_string(0)
        // clearInterval(this.stopwatch.interval_timer)

        this.btn_variant.a = 'outline-light'
        this.btn_variant.b = 'outline-light'
        this.btn_variant.c = 'outline-light'
        this.btn_variant.d = 'outline-light'
      })

      this.socket.on('disconnect', () => {
        this.connected = false
        console.log('disconnected')
      })

      this.socket.on('bell', (status) => {
        if (status.waiting) {
          this.btn_variant.quick_take = 'danger'
        } else {
          this.btn_variant.quick_take = 'outline-light'
          if (status.team == this.team_index) {
            this.show_alert('Bạn được phép trả lời!')
            this.light_trigger_sound.currentTime = 0.1
            this.light_trigger_sound.play()
          }
        }
      })

      this.socket.on('update', (p) => {
        const me = p[this.team_index]
        if (me.answered) {
          this.stopwatch.running = false
          this.stopwatch.string = this.convert_to_time_string(me.time_of_answer)
        }
      })

      this.socket.on('update_display', (players) => {
        const me = players[this.team_index]
        this.score = me.score
      })

      this.stopwatch.interval_timer = setInterval(() => {
        if (this.stopwatch.running)
          this.stopwatch.string = this.convert_to_time_string(
            Date.now() - this.stopwatch.start
          )
      }, 100)
    },
    request_stopwatch() {
      axios.get(`${this.host}/stopwatch`).then((res) => {
        let me = res.data.players[this.team_index]
        this.stopwatch.start = Date.now() - res.data.stopwatch.elapsed
        if (me.answered) {
          this.stopwatch.running = false
          this.stopwatch.string = this.convert_to_time_string(me.time_of_answer)
        } else {
          this.stopwatch.running = res.data.stopwatch.running
          if (this.stopwatch.running) {
            this.btn_variant.a = 'success'
            this.btn_variant.b = 'success'
            this.btn_variant.c = 'success'
            this.btn_variant.d = 'success'
          }
        }
      })
    },
    alert_countdown_changed(count) {
      this.alert.dismiss_countdown = count
    },
    show_alert(msg) {
      this.alert.dismiss_countdown = 2
      this.alert.message = msg
    },
  },
}
</script>

<style>
.container-fluid {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.field-label {
  color: white;
  padding: 0;
  margin: 0;
  text-align: left;
}

body {
  background-color: #eceff1 !important;
  background: url('~assets/background.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
</style>