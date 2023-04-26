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
    }[e];
    t ? n.removeAttribute("disabled") : n.setAttribute("disabled", !0)
}


function setError(e="") {
    document.getElementById("error").textContent = e,
    e ? document.getElementById("error").classList.remove("hidden") : document.getElementById("error").classList.add("hidden")
}


function setAuthError(e="") {
    document.getElementById("auth-error").textContent = e;
    e ? document.getElementById("auth-error").classList.remove("hidden") : document.getElementById("error").classList.add("hidden")
}

function setAuthStatus(status){
    const authBtn = document.querySelector('#signin-btn');
    authBtn.textContent = {
        default: "Sign In",
        loading: "Signing in...",
        done: "Signed In",
    }[status]
}

function isAuthenticated(callback) {
    chrome.storage.local.get("authToken", function(items) {
      const authToken = items.authToken;
      if (authToken) {
        // Authtoken exists, so user is authenticated
        callback(true);
      } else {
        // Authtoken does not exist, so user is not authenticated
        callback(false);
      }
    });
}
  

function saveToken(token) {
    chrome.storage.local.set({ "authToken": token }, function(){
        //  Data's been saved boys and girls, go on home
        console.log(token, 'stored');
    });
}

async function signIn() {
    const email = document.querySelector('#email-input');
    const password = document.querySelector("#password");

    const body = {
        email: email.value, 
        password: password.value
    };

    try {
        const response = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        setAuthStatus("default")
        setError(error);
    }
}

function signOut(callback) {
    // Remove the authToken from local storage
    chrome.storage.local.remove("authToken", function() {
        callback();
    });
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
document.getElementById("toggle-btn").addEventListener("click", (e => {
    const passwordInput = document.querySelector('#password');
    const toggleButton = document.querySelector('#toggle-btn');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = 'Show';
    }
}))
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
document.getElementById("signin-btn").addEventListener("click", (async e => {
    e.preventDefault();
    setAuthStatus("loading");
    try {
        const data = await signIn();
        if(data.success){
            setAuthStatus("done");
            saveToken(data.data.token.token);
            showAuthenticatedContent();
        }else{
            setAuthError(data.error.message);
            setAuthStatus("default");
        }
    } catch(err) {
        console.error(err);
        setAuthError(data.error.message);
    }
}
))
document.getElementById("signout-btn").addEventListener("click", (async e => {
    try {
        signOut(()=> showUnAuthenticatedContent());
    } catch(err) {

    }
}
))
const authenticatedContent = document.querySelector('#caden-body');
const unauthenticatedContent = document.querySelector('#signin-page');

//check if user is authenticated to display authenticated content or not

function showAuthenticatedContent () {
    authenticatedContent.style.display = 'block';
    unauthenticatedContent.style.display = 'none';
}
function showUnAuthenticatedContent () {
    authenticatedContent.style.display = 'none';
    unauthenticatedContent.style.display = 'block';
}
isAuthenticated((isAuth)=>{
    console.log('isauth: ', isAuth)
    if (isAuth) {
        // User is authenticated, so show the authenticated content
        showAuthenticatedContent();
    } else {
        // User is not authenticated, so show the unauthenticated content
        showUnAuthenticatedContent();
    }
})