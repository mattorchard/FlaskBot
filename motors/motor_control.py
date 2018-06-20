import time
import atexit
from Adafruit_MotorHAT import Adafruit_MotorHAT
EASE_PRECISION = 100


class MotorControl:

    def __init__(self, motor_hat_address=0x60):
        self.motor_hat = Adafruit_MotorHAT(addr=motor_hat_address)
        self.left = self.motor_hat.getMotor(4)
        self.right = self.motor_hat.getMotor(3)
        atexit.register(self.stop)

    @staticmethod
    def eased_speed(speed, complete):
        return int(4 * speed * complete * (1 - complete))

    def stop(self):
        self.left.run(Adafruit_MotorHAT.RELEASE)
        self.right.run(Adafruit_MotorHAT.RELEASE)
        self.left.setSpeed(0)
        self.right.setSpeed(0)

    def perform_move(self, move_command, eased=True):
        if move_command['speed_left'] > 0:
            self.left.run(Adafruit_MotorHAT.FORWARD)
        elif move_command['speed_left'] < 0:
            self.left.run(Adafruit_MotorHAT.BACKWARD)
        else:
            self.left.run(Adafruit_MotorHAT.RELEASE)

        if move_command['speed_right'] > 0:
            self.right.run(Adafruit_MotorHAT.FORWARD)
        elif move_command['speed_right'] < 0:
            self.right.run(Adafruit_MotorHAT.BACKWARD)
        else:
            self.right.run(Adafruit_MotorHAT.RELEASE)
        if eased:
            speed_left_original = abs(move_command['speed_left'])
            speed_right_original = abs(move_command['speed_right'])
            for i in range(0, EASE_PRECISION):
                self.left.setSpeed(MotorControl.eased_speed(speed_left_original, float(i) / float(EASE_PRECISION)))
                self.right.setSpeed(MotorControl.eased_speed(speed_right_original, float(i) / float(EASE_PRECISION)))
                time.sleep(float(move_command['duration']) / float(EASE_PRECISION))

        else:
            self.left.setSpeed(abs(move_command['speed_left']))
            self.right.setSpeed(abs(move_command['speed_right']))
            time.sleep(move_command['duration'])
        self.stop()
