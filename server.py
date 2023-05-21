from engineio.payload import Payload
from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room

Payload.max_decode_packets = 100
app = Flask(__name__)
app.config['SECRET_KEY'] = "wubba lubba dub dub"

sio = SocketIO(app)

users_in_room = {}
rooms_sid = {}
names_sid = {}
names_sid_mapping = {}


@app.route("/join", methods=["GET"])
def join():
    display_name = request.args.get('display_name')
    mute_audio = request.args.get('mute_audio') # 1 or 0
    mute_video = request.args.get('mute_video') # 1 or 0
    video_token = request.args.get("video_token")
    is_creator = request.args.get("is_creator")
    print(f"USER IS CREATOR: {is_creator}")
    room_id = request.args.get('room_id')
    session[room_id] = {"name": display_name,
                        "mute_audio": mute_audio, "mute_video": mute_video}
    return render_template("join.html", is_creator=is_creator, video_token=video_token, room_id=room_id, display_name=session[room_id]["name"], mute_audio=session[room_id]["mute_audio"], mute_video=session[room_id]["mute_video"])


@sio.on("connect")
def on_connect():
    sid = request.sid
    print("New socket connected ", sid)


@sio.on("join-room")
def on_join_room(data):
    sid = request.sid
    room_id = data["room_id"]
    display_name = session[room_id]["name"]

    # register sid to the room
    if display_name in names_sid_mapping:
        print(f"Detected page reloading in {display_name}")
        leave_from_call(names_sid_mapping[display_name], room_id)
    join_room(room_id)
    rooms_sid[sid] = room_id
    names_sid[sid] = display_name
    names_sid_mapping[display_name] = sid

    # broadcast to others in the room
    print("[{}] New member joined: {}<{}>".format(room_id, display_name, sid))
    emit("user-connect", {"sid": sid, "name": display_name},
         broadcast=True, include_self=False, room=room_id)

    # add to user list maintained on server
    if room_id not in users_in_room:
        users_in_room[room_id] = [sid]
        emit("user-list", {"my_id": sid})  # send own id only
    else:
        usrlist = {u_id: names_sid[u_id]
                   for u_id in users_in_room[room_id]}
        # send list of existing users to the new member
        emit("user-list", {"list": usrlist, "my_id": sid})
        # add new member to user list maintained on server
        users_in_room[room_id].append(sid)

    print("\nusers: ", users_in_room, "\n")


@sio.on("disconnect")
def on_disconnect():
    sid = request.sid
    try:
        room_id = rooms_sid[sid]
        display_name = names_sid[sid]
    except KeyError:
        return

    print("[{}] Member left: {}<{}>".format(room_id, display_name, sid))
    leave_from_call(sid, room_id)

    print("\nusers: ", users_in_room, "\n")


def leave_from_call(sid, room_id):
    emit("user-disconnect", {"sid": sid},
         broadcast=True, include_self=False, room=room_id)
    try:
        users_in_room[room_id].remove(sid)
    except BaseException as e:
        print(f"WARNING (users_in_room[room_id].remove(sid)): {e}")
    try:
        if len(users_in_room[room_id]) == 0:
            users_in_room.pop(room_id)
    except BaseException as e:
        print(f"WARNING (if len(users_in_room[room_id]) == 0:): {e}")

    leave_room(room_id, sid)
    try:
        rooms_sid.pop(sid)
    except BaseException as e:
        print(e)
    try:
        names_sid.pop(sid)
    except BaseException as e:
        print(e)


@sio.on("data")
def on_data(data):
    sender_sid = data['sender_id']
    target_sid = data['target_id']
    if sender_sid != request.sid:
        print("[Not supposed to happen!] request.sid and sender_id don't match!!!")

    if data["type"] != "new-ice-candidate":
        print('{} message from {} to {}'.format(
            data["type"], sender_sid, target_sid))
    sio.emit('data', data, room=target_sid)


if __name__ == "__main__":
    sio.run(app, host="localhost", port=5001)
