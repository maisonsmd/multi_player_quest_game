const express = require('express');

// // create an instance of express to serve our end points
const app = express();
const cors = require('cors');
app.use(cors());

const http = require('http').createServer(app);
const io = require('socket.io')(http);
io.origins('*:*');

let stopwatch = {
    running: false,
    start: 0,
}

const num_players = 6
let players = []
let players_display = []

let waiting_bell = false;

for (let i = 0; i < num_players; ++i) {
    players[i] = {
        answered: false,
        score: 0,
        answer: '',
        time_of_answer: 0,
        order_of_answer: 0,
    }
    players_display[i] = {
        answered: false,
        score: 0,
        answer: '',
        time_of_answer: 0,
        order_of_answer: 0,
    }
}
function sort_order() {

    // sort who go first
    // copy array
    let temp = [];
    for (let i = 0; i < num_players; ++i) {
        temp[i] = {
            answered: players[i].answered,
            time_of_answer: players[i].time_of_answer,
            index: i
        }
    }
    temp.sort((a, b) => {
        if (!a.answered) return 1;
        if (!b.answered) return -1;
        return a.time_of_answer - b.time_of_answer;
    })
    temp = temp.filter(t => t.answered);
    for (let i = 0; i < temp.length; ++i) {
        players[temp[i].index].order_of_answer = i + 1;
    }
    io.emit('update', players);
}

app.get('/players', (req, res) => {
    return res.json(players);
})
app.get('/players_display', (req, res) => {
    return res.json(players_display);
})
app.get('/stopwatch', (req, res) => {
    let teamp_players_time = players.map(p => {
        return { answered: p.answered, time_of_answer: p.time_of_answer }
    })
    stopwatch.elapsed = stopwatch.running ? (Date.now() - stopwatch.start) : 0;
    return res.json({ stopwatch, players: teamp_players_time});
})

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    socket.on('disconnect', () => {
        console.log('a user disconnected')
    })
    socket.on('start_answer', msg => {
        console.log('start_answer');
        stopwatch.running = true;
        stopwatch.start = Date.now();
        io.emit('stopwatch_start');
        players.forEach(p => {
            p.answered = false
            p.time_of_answer = 0
            p.answer = ''
            p.order_of_answer = 0
        });
        players_display.forEach(p => {
            p.answered = false
            p.time_of_answer = 0
            p.answer = ''
            p.order_of_answer = 0
        });
        io.emit('update', players)
        io.emit('update_display', players_display)
    });
    socket.on('stop_answer', msg => {
        console.log('stop_answer');
        stopwatch.running = false;
        io.emit('stopwatch_stop', Date.now() - stopwatch.start);
        sort_order();

        for (let i = 0; i < num_players; ++i) {
            players_display[i].answer = players[i].answer;
            players_display[i].time_of_answer = players[i].time_of_answer;
            players_display[i].order_of_answer = players[i].order_of_answer;
        }
        io.emit('update_display', players_display);
    });
    socket.on('update_display', msg => {
        for (let i = 0; i < num_players; ++i) {
            players_display[i].score = players[i].score;
            players_display[i].time_of_answer = players[i].time_of_answer;
            players_display[i].order_of_answer = players[i].order_of_answer;
            players_display[i].answer = players[i].answer;
        }
        io.emit('update_display', players_display);
    });
    socket.on('update_temp_score', msg => {
        for (let i = 0; i < num_players; ++i) {
            players[i].score = msg[i].score
        }
    });

    socket.on('enable_bell', msg => {
        console.log('waiting_bell');
        waiting_bell = true
        io.emit('bell', {
            waiting: true
        })
    });

    socket.on('answer', (msg) => {
        if (!stopwatch.running)
            return;
        if (msg.team < 0 || msg.team >= num_players)
            return;
        if (players[msg.team].answered)
            return;
        if (!msg.answer)
            return;

        players[msg.team].time_of_answer = Date.now() - stopwatch.start;
        players[msg.team].answered = true;
        players[msg.team].answer = msg.answer;

        io.emit('update', players);
        sort_order();
    });
    socket.on('quick_take', (team) => {
        if (!waiting_bell)
            return;

        io.emit('bell', {
            waiting: false,
            team: team
        })
        waiting_bell = false;
    })
});

const server = http.listen(3001, () => {
    console.log('listening on %s...', server.address());
});