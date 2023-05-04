const RESPOND_TYPE = "write-btn";
const ASK_TYPE = "ask-btn";
const URL = 'https://caden-server.herokuapp.com';

function getText() {
    return window.getSelection().toString()
}

function normalize(e) {
    return 0 === e.trim().length ? "" : e
}

function setStatus(e="waiting", id=RESPOND_TYPE, t=!0) {
    const p = document.getElementById(`${id}-p`);
    const s = document.getElementById(`${id}-svg`);

    if(p !== null){
        p.textContent = {
            waiting: id === RESPOND_TYPE ? "Respond" : "Ask GPT",
            thinking: "Thinking...",
            writing: "Writing...",
            revise: "Revise"
        }[e];
        e === 'writing' || e === 'thinking' ? s.classList.add("hidden") : s.classList.remove("hidden"); 
        t ? p.removeAttribute("disabled") : p.setAttribute("disabled", !0);    
    }        
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

function getToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["authToken", "id"], function(items) {
            const authToken = items.authToken;
            const id = items.id;
            if (authToken && id) {
                // Both authToken and id exist, so user is authenticated
                resolve({ authToken, id });
            } else {
                // Either authToken or id does not exist, so user is not authenticated
                resolve(false);
            }
        });
    });
}
function saveToken(token, id) {
    chrome.storage.local.set({ 
        "authToken": token,
        "id": id
    }, function(){
        // Data's been saved boys and girls, go on home
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
        const response = await fetch(`${URL}/auth/login`, {
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
    chrome.storage.local.remove(["authToken", "id"], function() {
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

async function fetchResponse (text, content="") {
    let email;
    if(content.length>0){
        email = `${text}, ${content}`
    } else {
        email = text;
    }
    try {
        setStatus("writing", RESPOND_TYPE , !1)
        const user = await getToken();
        const body = {
            email,
            id: user.id
        }
        const response = await fetch(`${URL}/write/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': user.authToken
            },
            body: JSON.stringify( body )
        });
        if(response.status === 401) { //if the token is unauthorized at moment of request
            showUnAuthenticatedContent() //force a log out;
            return
          }
        const data = await response.json();
        return data.data.output;
    } catch (error) {
      setError(error);
    }
};

async function fetchGPTResponse (text) {
    try {
        setStatus("writing", ASK_TYPE, !1)
        const user = await getToken();
        const body = {
            email: text,
            id: user.id
        }
        const response = await fetch(`${URL}/write/gpt`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': user.authToken
        },
        body: JSON.stringify(body)
      });
      if(response.status === 401) { //if the token is unauthorized at moment of request
        showUnAuthenticatedContent() //force a log out;
        return
      }
      const data = await response.json();
      return data.data.output;
    } catch (error) {
      setError(error);
    }
};

async function handleSignIn (e) {
    e.preventDefault();
    setAuthStatus("loading");
    try {
        const data = await signIn();
        if(data.success){
            setAuthStatus("default");
            saveToken(data.data.token.token, data.data.id);
            showAuthenticatedContent();
        } else {
            setAuthError(data.error.message);
            setAuthStatus("default");
        }
    } catch(err) {
        console.error(err);
        setAuthError(data.error.message);
    }
}
async function handleSignOut (e) {
    try {
        signOut(()=> showUnAuthenticatedContent());
    } catch(err) {
        console.error("something went wrong")
    }
}
async function handleCopyResponse (e) {
    const t = document.getElementById("copy-reply").textContent;
    setTimeout((()=>{
        document.getElementById("copy-btn").textContent = "Copy 📄"
    }
    ), 3e3),
    copyToClipboard(t),
    document.getElementById("copy-btn").textContent = "Copied!"
};
async function handleEmailResponse (e) {
    try {
        setError(""),
        setStatus("thinking", !1);
        const textarea = document.getElementById("gpt-context");
        const content = textarea.value;
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
        if (!n){
            return setError("You haven't selected any text! Highlight some text on the page to give Caden context for the reply. This works best if it's email content!"),
            void setStatus("waiting", RESPOND_TYPE, !0);
        }
        // call api
        const text = await fetchResponse(t.result, content)

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
async function handleAskGPT (e) {
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
document.getElementById("write-btn").addEventListener("click", handleEmailResponse),
document.getElementById("ask-btn-id").addEventListener("click", handleAskGPT),
document.getElementById("copy-btn").addEventListener("click", handleCopyResponse)
document.querySelector('.form').addEventListener('submit', handleSignIn);
document.getElementById("signin-btn").addEventListener("click", handleSignIn);
document.getElementById("signout-btn").addEventListener("click", handleSignOut)
const authenticatedContent = document.querySelector('#caden-body');
const unauthenticatedContent = document.querySelector('#signin-page');

//check if user is authenticated to display authenticated content or not

function showAuthenticatedContent () {
    authenticatedContent.style.display = 'block';
    unauthenticatedContent.style.display = 'none';
    const signOutBtn = document.getElementById("signout-btn");
    signOutBtn.classList.remove("hidden")
}
function showUnAuthenticatedContent () {
    authenticatedContent.style.display = 'none';
    unauthenticatedContent.style.display = 'block';
    const signOutBtn = document.getElementById("signout-btn");
    signOutBtn.classList.add("hidden")
}
isAuthenticated((isAuth)=>{
    if (isAuth) {
        // User is authenticated, so show the authenticated content
        showAuthenticatedContent();
    } else {
        // User is not authenticated, so show the unauthenticated content
        showUnAuthenticatedContent();
    }
})