from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, leave_room, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*",async_mode="threading")

# Store drawing history per room
rooms = {}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('join_room')
def handle_join(data):
    room = data['room']
    join_room(room)

    if room not in rooms:
        rooms[room] = []

    # Send existing drawing history to new user
    emit('drawing_history', rooms[room])

@socketio.on('drawing_event')
def handle_drawing(data):
    room = data['room']

    # Save drawing data
    rooms[room].append(data)

    # Broadcast to all except sender
    emit('drawing_event', data, room=room, include_self=False)

@socketio.on('clear_canvas')
def clear_canvas(data):
    room = data['room']
    rooms[room] = []
    emit('clear_canvas', room=room)

if __name__ == '__main__':
    socketio.run(socketio.run(app, debug=False, use_reloader=False))