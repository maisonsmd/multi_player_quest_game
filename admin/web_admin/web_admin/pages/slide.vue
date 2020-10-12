<template>
  <b-container fluid>
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

    <div class="w-100 h-100">
      <b-row
        align-h="center"
        class="text-white m-0"
        style="margin-top: 15vh !important"
      >
        <b-col
          sm="2"
          class="p-1"
          v-for="(player, index) in players"
          :key="index"
        >
          <b-row align-h="center">
            <b-col sm="11">
              <h1 style="font-size: 4rem" class="font-weight-bold">
                {{ player.score }}
              </h1>
              <b-img
                :src="get_logo_src(index)"
                fluid
                width="300px"
                height="300px"
              ></b-img>
              <b-form-textarea
                size="lg"
                rows="2"
                disabled
                no-resize
                class="text-center mt-5 p-1 text-uppercase font-weight-bold text-danger"
                style="border-radius: 0; font-size: 2rem"
                :value="player.answer"
              ></b-form-textarea>

              <h1 style="font-size: 2rem" class="mt-5 font-weight-bold">
                {{ player.time_of_answer }}
              </h1>
              <h1 style="font-size: 3rem" class="mt-3 text-warning">
                {{ player.order_of_answer > 0 ? player.order_of_answer : ' ' }}
              </h1>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </div>

    <div style="position: fixed; top: 30px; right: 50px">
      <h1 class="text-white text-monospace">{{ stopwatch.string }}</h1>
    </div>
  </b-container>
</template>

<script>
import io from 'socket.io-client'
import axios from 'axios'

export default {
  name: 'slide',
  data() {
    return {
      host: '',
      socket: null,
      alert: {
        dismiss_countdown: 0,
        message: '',
      },
      players: [],
      num_players: 6,
      connected: false,
      stopwatch: {
        running: false,
        start: 0,
        interval_timer: -1,
        string: '0:00.00',
      },
    }
  },
  created() {
    this.host = `http://${window.location.hostname}:3001`
    document.title = 'slide'
    this.init_socket()

    for (let i = 0; i < this.num_players; i++)
      this.$set(this.players, i, {
        index: i,
        name: 'ĐỘI ' + (i + 1),
        score: 0,
        answer: '',
        time_of_answer: 0,
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
            : '_'
        this.players[i].order_of_answer = res.data[i].order_of_answer
      }
    })
  },
  methods: {
    get_logo_src(index) {
      return require('../assets/logo/' + (index + 1) + '.jpg')
    },
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
    alert_countdown_changed(count) {
      this.alert.dismiss_countdown = count
    },
    show_alert(msg) {
      this.alert.dismiss_countdown = 2
      this.alert.message = msg
    },
    request_stopwatch() {
      axios.get(`${this.host}/stopwatch`).then((res) => {
        this.stopwatch.running = res.data.stopwatch.running
        this.stopwatch.start = Date.now() - res.data.stopwatch.elapsed
      })
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
        // this.stopwatch.string = this.convert_to_time_string(0)
        // clearInterval(this.stopwatch.interval_timer)
      })
      this.socket.on('update_display', (data) => {
        for (let i = 0; i < this.num_players; i++) {
          this.players[i].score = data[i].score
          this.players[i].answer = data[i].answer
          this.players[i].time_of_answer =
            data[i].time_of_answer > 0
              ? this.convert_to_time_string(data[i].time_of_answer)
              : '_'
          this.players[i].order_of_answer = data[i].order_of_answer
        }
      })

      this.socket.on('bell', (status) => {
        this.waiting_bell = status.waiting
        if (!status.waiting) {
          this.show_alert(`Đội ${status.team + 1} trả lời!`)
        }
      })

      this.stopwatch.interval_timer = setInterval(() => {
        if (this.stopwatch.running)
          this.stopwatch.string = this.convert_to_time_string(
            Date.now() - this.stopwatch.start
          )
      }, 100)
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