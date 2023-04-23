function getText() {
    return window.getSelection().toString()
}
function normalize(e) {
    return 0 === e.trim().length ? "" : e
}

function setStatus(e="waiting", t=!0) {
    const n = document.getElementById("write-btn");
    n.textContent = {
        waiting: "Write ✏️",
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
            void setStatus("waiting", !0);
        //call api
        //then
        text="response from caden";
        normalize(text);
        setStatus("waiting", !0);
        (document.getElementById("done").classList.remove("hidden"),
        document.getElementById("reply").textContent = text,
        document.getElementById("copy-reply").textContent = text,
        copyToClipboard(text))
        
    } catch (e) {
        console.error(e),
        document.getElementById("error").textContent = "Something went wrong, please try again!",
        setStatus("waiting", !0)
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
