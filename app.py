from flask import Flask, render_template, request, Response, jsonify, url_for, send_file
from flask_celery import make_celery
from camera.camera_open_cv import CameraOpenCv as Camera
from os import environ
if environ.get("motor_mock"):
    from motors.motor_control_mock import MotorControlMock as MotorControl
else:
    from motors.motor_control import MotorControl

app = Flask(__name__)
app.config['CELERY_BROKER_URL'] = 'amqp://localhost//'
app.config['CELERY_RESULT_BACKEND'] = 'rpc://'
celery = make_celery(app)
mc = MotorControl()

STREAMING_ENABLED = True


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/motor/move", methods=["POST"])
def motor_move():
    params = request.get_json(force=True)
    command_list = params["moves"]
    for move_command in command_list:
        print str(move_command)
        motor_move_task.delay(move_command)
    return jsonify(params)


@app.route("/video/enable", methods=["GET", "POST"])
def video_enable():
    global STREAMING_ENABLED
    if request.method == "POST":
        params = request.get_json(force=True)
        STREAMING_ENABLED = bool(params["enabled"])
        print "Streaming enabled set to: " + str(STREAMING_ENABLED)
    return jsonify({"enabled": STREAMING_ENABLED})


@app.route("/video/feed")
def video_feed():
    if STREAMING_ENABLED:
        return Response(generate_feed(Camera()), mimetype="multipart/x-mixed-replace; boundary=frame")
    else:
        return send_file("./static/images/StreamOffline.png", mimetype='image/png')


@celery.task(name="app.motor_move_task")
def motor_move_task(move_command):
    mc.perform_move(move_command)


def generate_feed(camera):
    while STREAMING_ENABLED:
        frame = camera.get_frame()
        yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


if __name__ == "__main__":
    app.run(host="0.0.0.0", threaded=True, debug=True)
