from flask import Flask, render_template, request, Response, jsonify, url_for, send_file
from camera.camera_open_cv import CameraOpenCv as Camera

app = Flask(__name__)
STREAMING_ENABLED = True


@app.route("/")
def index():
    return render_template("index.html")


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


def generate_feed(camera):
    while STREAMING_ENABLED:
        frame = camera.get_frame()
        yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


if __name__ == "__main__":
    app.run(port="0.0.0.0")
