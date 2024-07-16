class KeyPressListener {
  constructor(keyCode, callback) {
    let keySafe = true;
    this.keydownFunction = function (event) {
      if (event.code === keyCode) {
        if (keySafe) {
          keySafe = false;
          callback();
        }
      }
    };
    this.keyupFunction = function (event) {
      if (event.code === keyCode) {
        keySafe = true;
      }
    };

    this.touchstartFunction = function (event) {
      if (keySafe) {
        keySafe = false;
        callback();
      }
    };

    this.touchendFunction = function (event) {
      keySafe = true;
    };

    document.addEventListener("keydown", this.keydownFunction);
    document.addEventListener("keyup", this.keyupFunction);
    document.addEventListener("touchstart", this.touchstartFunction);
    document.addEventListener("touchend", this.touchendFunction);
  }

  unbind() {
    document.removeEventListener("keydown", this.keydownFunction);
    document.removeEventListener("keyup", this.keyupFunction);
    document.removeEventListener("touchstart", this.touchstartFunction);
    document.removeEventListener("touchend", this.touchendFunction);
  }
}
