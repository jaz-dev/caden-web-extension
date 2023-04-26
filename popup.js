const RESPOND_TYPE = "write-btn";
const ASK_TYPE = "ask-btn-id";
function getText() {
    return window.getSelection().toString()
}
function normalize(e) {
    return 0 === e.trim().length ? "" : e
}

function setStatus(e="waiting", id=RESPOND_TYPE, t=!0) {
    const n = document.getElementById(id)
    n.textContent = {
        waiting: "Respond ✏️",
        thinking: "🤔 Thinking...",
        writing: "📝 Writing...",
        revise: "Revise 🔄"
    }[e],
    t ? n.removeAttribute("disabled") : n.setAttribute("disabled", !0)
}

function setError(e="") {
    document.getElementById("error").textContent = e,
    e ? document.getElementById("error").classList.remove("hidden") : document.getElementById("error").classList.add("hidden")
}
function copyToClipboard(e) {
    const t = document.createElement("textarea");
    t.value = e,
    t.setAttribute("readonly", ""),
    t.style.position = "absolute",
    t.style.left = "-9999px",
    document.body.appendChild(t),
    t.select(),
    document.execCommand("copy"),
    document.body.removeChild(t)
}
async function fetchResponse (text) {
    try {
        setStatus("writing", RESPOND_TYPE , !1)
        const response = await fetch('http://localhost:3001/write/', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: text })
        });
        const data = await response.json();
        return data.data.output;
    } catch (error) {
      setError(error);
    }
};

async function fetchGPTResponse (text) {
    try {
        setStatus("writing", ASK_TYPE, !1)
        const response = await fetch('http://localhost:3001/write/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: text })
      });
      const data = await response.json();
      return data.data.output;
    } catch (error) {
      setError(error);
    }
};

"undefined" != typeof chrome ? "undefined" != typeof browser ? (console.log("Caden is running in browser: Firefox"),
chrome = browser) : console.log("Caden is running in browser: Chrome") : console.log("Caden is running in browser: unsupported"),
document.getElementById("close-btn").addEventListener("click", (e=>window.close())),
document.getElementById("write-btn").addEventListener("click", (async e=>{
    try {
        setError(""),
        setStatus("thinking", !1);
        const e = (await chrome.tabs.query({
            active: !0,
            currentWindow: !0
        }))[0]
          , [t] = await chrome.scripting.executeScript({
            target: {
                tabId: e.id
            },
            func: getText
        })
          , n = t ? t.result : "";
        if (!n)
            return setError("You haven't selected any text! Highlight some text on the page to give Caden context for the reply. This works best if it's email content!"),
            void setStatus("waiting", RESPOND_TYPE, !0);
        // call api
        const text = await fetchResponse(t.result)

        // text = data;
        normalize(text);
        setStatus("waiting", RESPOND_TYPE, !0);
        (document.getElementById("done").classList.remove("hidden"),
        document.getElementById("reply").textContent = text,
        document.getElementById("copy-reply").textContent = text,
        copyToClipboard(text))
        
    } catch (e) {
        console.error(e),
        document.getElementById("error").textContent = "Something went wrong, please try again!",
        setStatus("waiting", RESPOND_TYPE, !0)
    }
}
)),
document.getElementById("ask-btn-id").addEventListener("click", (async e=>{
    try {
        setError(""),
        setStatus("thinking", ASK_TYPE, !1);
        const textarea = document.getElementById("gpt-context");
        const content = textarea.value;
        if (!content)
            return setError("Please write your question/comment in the context box"),
            void setStatus("waiting", ASK_TYPE, !0);
        const text = await fetchGPTResponse(content)

        // text = data;
        normalize(text);
        setStatus("waiting", ASK_TYPE, !0);
        (document.getElementById("done").classList.remove("hidden"),
        document.getElementById("reply").textContent = text,
        document.getElementById("copy-reply").textContent = text,
        copyToClipboard(text))
        
    } catch (e) {
        console.error(e),
        document.getElementById("error").textContent = "Something went wrong, please try again!",
        setStatus("waiting", ASK_TYPE, !0)
    }
}
)),
document.getElementById("copy-btn").addEventListener("click", (e=>{
    const t = document.getElementById("copy-reply").textContent;
    setTimeout((()=>{
        document.getElementById("copy-btn").textContent = "Copy 📄"
    }
    ), 3e3),
    copyToClipboard(t),
    document.getElementById("copy-btn").textContent = "Copied!"
}
))
