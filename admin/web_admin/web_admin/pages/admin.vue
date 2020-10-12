<template>
  <b-container fluid v-if="render">
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
        font-size: 2rem;
      "
      >{{ alert.message }}
    </b-alert>

    <b-alert
      variant="danger"
      show
      v-if="!connected"
      fade
      class="text-uppercase font-weight-bold"
      style="max-width: 300px; position: fixed; top: 10px; left: 10px"
    >
      lost connection!</b-alert
    >

    <div class="w-100 mt-5 pt-5">
      <b-row align-h="center" class="m-0">
        <b-col
          sm="2"
          class="p-1"
          v-for="(player, index) in players"
          :key="index"
        >
          <b-card :title="player.name" tag="article" class="mb-2 shadow">
            <b-row class="mt-2">
              <p class="field-label">Điểm số</p>
              <b-input
                style="font-size: 1.5rem"
                type="number"
                class="text-center"
                v-model="player.score"
              >
              </b-input>
            </b-row>
            <b-row class="mt-2">
              <b-col sm="6" class="p-0 pr-1">
                <b-button
                  class="w-100"
                  variant="outline-danger"
                  @click="
                    player.score = +player.score - 10
                    if (player.score < 0) player.score = 0
                    update_temp_score()
                  "
                >
                  -10
                </b-button>
              </b-col>
              <b-col sm="6" class="p-0 pl-1">
                <b-button
                  class="w-100"
                  variant="outline-success"
                  @click="
                    players[index].score = +players[index].score + 10
                    update_temp_score()
                  "
                >
                  +10
                </b-button>
              </b-col>
            </b-row>
            <b-row class="mt-2">
              <p class="field-label">Đáp án</p>

              <b-form-textarea
                size="lg"
                v-model="player.answer"
                rows="3"
                no-resize
                disabled
                class="text-center text-uppercase font-weight-bold text"
              ></b-form-textarea>
              <!-- <b-input
                class="text-center"
                disabled
                v-model="player.answer"
              ></b-input> -->
            </b-row>
            <b-row class="mt-2">
              <p class="field-label">Thời gian trả lời</p>
              <b-input
                class="text-center font-weight-bold"
                style="font-size: 1.5rem"
                disabled
                v-model="player.time_of_answer"
              ></b-input>
            </b-row>
            <b-row class="mt-2">
              <p class="field-label">Thứ tự</p>
              <h1 class="pl-2">
                {{ player.order_of_answer > 0 ? player.order_of_answer : '_' }}
              </h1>
            </b-row>
          </b-card>
        </b-col>
      </b-row>

      <b-row align-h="center">
        <b-col sm="3">
          <b-button
            class="p-3 text-white text-uppercase"
            style="font-size: 1.5rem"
            :variant="btn_variant.start_answer"
            @click="start_answer"
          >
            Bấm giờ trả lời<br />(shift+1)</b-button
          >
        </b-col>
        <b-col sm="3">
          <b-button
            class="p-3 text-white text-uppercase"
            style="font-size: 1.5rem"
            :variant="btn_variant.stop_answer"
            @click="stop_answer"
          >
            Dừng đồng hồ<br />(shift+2)</b-button
          >
        </b-col>
        <b-col sm="3">
          <b-button
            class="p-3 text-white text-uppercase"
            style="font-size: 1.5rem"
            :variant="btn_variant.enable_bell"
            :disabled="waiting_bell"
            @click="enable_bell"
          >
            Cho phép chuông<br />(shift+3)</b-button
          >
        </b-col>
        <b-col sm="3">
          <b-button
            class="p-3 text-white text-uppercase"
            style="font-size: 1.5rem"
            :variant="btn_variant.update_display"
            @click="update_display"
          >
            cập nhập điểm<br />(shift+4)</b-button
          >
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="12"
          ><h1 class="text-white text-monospace mt-3" style="font-size: 5rem">
            {{ stopwatch.string }}
          </h1></b-col
        >
      </b-row>
    </div>
  </b-container>
</template>

<script>
import io from 'socket.io-client'
import axios from 'axios'

export default {
  name: 'admin',
  components: {},
  data() {
    return {
      host: '',
      btn_variant: {
        start_answer: 'outline-success',
        stop_answer: 'outline-danger',
        enable_bell: 'outline-warning',
        update_display: 'outline-warning',
      },
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
      socket: null,
      connected: false,
      render: false,
      players: [],
      num_players: 6,
      bell_audio: new Audio('ding.mp3'),
      waiting_bell: false,
    }
  },
  created() {
    this.host = `http://${window.location.hostname}:3001`
    document.title = 'admin'
    if (window.location.hostname != 'localhost') {
      window.location.href = '/'
      return
    }
    this.render = true
    this.init_socket()

    for (let i = 0; i < this.num_players; i++)
      this.$set(this.players, i, {
        index: i,
        name: 'ĐỘI ' + (i + 1),
        score: 0,
        answer: '',
        time_of_answer: '',
        order_of_answer: 0,
      })

    this.request_stopwatch()
    axios.get(`${this.host}/players`).then((res) => {
      for (let i = 0; i < this.num_players; i++) {
        this.players[i].score = res.data[i].score
        this.players[i].answer = res.data[i].answer
        this.players[i].time_of_answer =
          res.data[i].time_of_answer > 0
            ? this.convert_to_time_string(res.data[i].time_of_answer)
            : ''
        this.players[i].order_of_answer = res.data[i].order_of_answer
      }
    })

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
          this.start_answer()
          this.btn_variant.start_answer = 'success'
          setTimeout(
            () => (this.btn_variant.start_answer = 'outline-success'),
            300
          )
          break
        case '2':
        case '@':
          this.stop_answer()
          this.btn_variant.stop_answer = 'danger'
          setTimeout(
            () => (this.btn_variant.stop_answer = 'outline-danger'),
            300
          )
          break
        case '3':
        case '#':
          this.enable_bell()
          this.btn_variant.enable_bell = 'warning'
          setTimeout(
            () => (this.btn_variant.enable_bell = 'outline-warning'),
            300
          )
          break
        case '4':
        case '$':
          this.update_display()
          this.btn_variant.update_display = 'warning'
          setTimeout(
            () => (this.btn_variant.update_display = 'outline-warning'),
            300
          )
          break
      }
    }
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
    init_socket() {
      this.socket = io.connect(this.host)

      this.socket.on('connect', () => {
        this.connected = true
        console.log('connected')
      })
      this.socket.on('disconnect', () => {
        this.connected = false
        console.log('disconnected')
      })
      this.socket.on('stopwatch_start', (data) => {
        this.stopwatch.start = Date.now()
        this.stopwatch.running = true
      })
      this.socket.on('stopwatch_stop', (data) => {
        if (!this.stopwatch.running) {
          this.stopwatch.string = this.convert_to_time_string(0)
          return
        }
        this.stopwatch.string = this.convert_to_time_string(data)

        this.stopwatch.running = false
        // clearInterval(this.stopwatch.interval_timer)
      })
      this.socket.on('update', (data) => {
        for (let i = 0; i < this.num_players; i++) {
          this.players[i].score = data[i].score
          this.players[i].answer = data[i].answer
          this.players[i].time_of_answer =
            data[i].time_of_answer > 0
              ? this.convert_to_time_string(data[i].time_of_answer)
              : ''
          this.players[i].order_of_answer = data[i].order_of_answer
        }
      })

      this.socket.on('bell', (status) => {
        this.waiting_bell = status.waiting
        if (!status.waiting) {
          this.show_alert(`Đội ${status.team + 1} trả lời!`)
          this.bell_audio.currentTime = 0.1
          this.bell_audio.play()
        }
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
        this.stopwatch.running = res.data.stopwatch.running
        this.stopwatch.start = Date.now() - res.data.stopwatch.elapsed
      })
    },

    update_display() {
      if (this.stopwatch.running) this.show_alert('Ngừng nhận đáp án trước!')
      else this.socket.emit('update_display')
    },
    update_temp_score() {
      this.socket.emit('update_temp_score', this.players)
    },
    start_answer() {
      this.socket.emit('start_answer')
    },
    stop_answer() {
      this.socket.emit('stop_answer')
    },
    alert_countdown_changed(count) {
      this.alert.dismiss_countdown = count
    },
    show_alert(msg) {
      this.alert.dismiss_countdown = 2
      this.alert.message = msg
    },
    enable_bell() {
      this.socket.emit('enable_bell')
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
