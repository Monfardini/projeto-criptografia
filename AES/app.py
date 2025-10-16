from flask import Flask, render_template, request
from aes_core import aes_cbc_encrypt, aes_cbc_decrypt
import base64

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    result = ""
    error = ""
    if request.method == "POST":
        text = request.form.get("text").encode()
        key = request.form.get("key").encode()
        iv = request.form.get("iv").encode()
        mode = request.form.get("mode")
        action = request.form.get("action")

        try:
            if action == "encrypt":
                cipher = aes_cbc_encrypt(text, key, iv)
                result = base64.b64encode(cipher).decode()
            elif action == "decrypt":
                cipher = base64.b64decode(text)
                result = aes_cbc_decrypt(cipher, key, iv).decode()
        except Exception as e:
            error = str(e)

    return render_template("index.html", result=result, error=error)
    
if __name__ == "__main__":
    app.run(debug=True)
