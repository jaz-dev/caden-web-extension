console.log('caden ai content script loaded');
// // const URL = 'http://localhost:3001';
const URL = 'https://caden-server.herokuapp.com';

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

function removeDiv(event) {
  var div = document.getElementById("added-div");
  div.style.display = "none";

}

function getToken() {
  return new Promise((resolve, reject) => {
      chrome.storage.local.get(["authToken", "id"], function(items) {
          const authToken = items.authToken;
          const id = items.id;
          if (authToken && id) {
              // Both authToken and id exist, so user is authenticated
              resolve({ authToken, id });
          } else {
              // Either authToken or id does not exist, so user is not authenticated
              reject(false);
          }
      });
  });
}
function setStatus(e, t=!0) {
  const p = document.getElementById("submit-btn");
  if(p !== null){
      p.value = {
          uploading: "Uploading...",
          default: "Save as Template",
          responding: "Responding...",
          respond: "Respond To This",
      }[e]
  }        
}
async function uploadTemplateRequest(user, title, text){
  const body = {
    userId: user.id,
    title,
    text,
    genre: "draft"
  }
  try {
    setStatus("uploading")
    const response = await fetch(`${URL}/train/add-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': user.authToken
      },
      body: JSON.stringify( body )
    });
    setStatus("default")
    const data = await response.json();
    return data;
  } catch (error) {
    
  }
}
function setError(e="") {
  appendDiv("error", "Something Went Wrong");
}

async function fetchResponse(user, context, text){
  const body = {
    email: text,
    id: user.id,
    context,
  }
  try {
    setStatus("responding")
    const response = await fetch(`${URL}/write/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': user.authToken
      },
      body: JSON.stringify( body )
    });
    if(response.status === 200){
      setStatus("respond")
      const data = await response.json();
      return data.data.output;
    } else {
      return null
    }
  } catch (error) {
    setError(error);
  }
}

async function handleSubmitRequest(e, data) {
  e.preventDefault()
  //send data to service worker
  const form = document.getElementById("query-form");
  const title = document.getElementById("tool-input").value
  const select = document.getElementById("request-type");
  const requestType = select.options[select.selectedIndex].value;

  const user = await getToken();

  if(requestType === "upload"){
    if(!form.checkValidity()){
      e.preventDefault();
      form.reportValidity();
    } else {
      const res = await uploadTemplateRequest(user, title, data)
      if(res?.success){
        //show notification
        appendDiv("template-uploaded", "Template uploaded successfully");
        //remove notif
        setTimeout(()=>{
          removeInnerDiv()
        }, 3000)
      }
    }
    }else{
      const text = await fetchResponse(user, title, data)
      copyToClipboard(text);
      appendDiv("respond", text);
    }
}
async function handleMouseUp(event) {
  await isAuthenticated()
  .then(result => {
    if(result){
      var selectedText = window.getSelection().toString();
      var range = window.getSelection().getRangeAt(0);

      if (range && range.commonAncestorContainer) {
        const parentElement = range.commonAncestorContainer.parentElement;

        var rect = range.getBoundingClientRect();

        const isClickInside = parentElement.contains(event.target);

        if (selectedText !== "" && isClickInside) {
          // Rest of your code...

          if (selectedText !== "" && isClickInside) {
            const div = document.getElementById("added-div");
        
            div.style.display = "flex";
            div.style.position = "absolute";
            div.style.top = rect.bottom + "px";
            div.style.left = rect.left + "px";
            div.style.position = "absolute";
            div.style.color = '#27272A';
            div.style.borderRadius = '5px';
            div.style.alignItems = 'center';
            div.style.height = "60px";
            div.style.width = "580px"
            div.style.zIndex = 10;
            div.style.backgroundColor = '#F4F5F8';
            div.style.fontFamily = 'Lato, sans-serif';
        
        
            div.innerHTML = `
              <div id="inner-div">
                <button type="button" role="combobox" aria-controls="radix-:rr:" aria-expanded="false" aria-autocomplete="none" dir="ltr" data-state="closed" class="select_triger div-btn">
                  <select name="requests" id="request-type">
                    <option value="upload">Upload</option>
                    <option value="respond">Respond</option>
                  </select>
                </button>
                <form id="query-form">
                  <input type="text" id="tool-input" placeholder="Add a title/subject of the email" required>
                  </input>
                  <input type="submit" id="submit-btn" class="div-btn" value="Save Email as Template">
                </form>
                <div id="close-btn" class="div-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 96 960 960" width="16">
                    <path d="M480 632 284 828q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536 576l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480 632Z"/>
                  </svg>          
                </div>
              </div>`;
            
            div.addEventListener("mouseup", function (event) {
              event.stopPropagation();
            });
            const innerDiv = document.getElementById("inner-div");
            innerDiv.style.display = "flex";
            innerDiv.style.justifyContent = 'space-between';
            innerDiv.style.alignItems = 'center';
            innerDiv.style.gap = "1rem";
            innerDiv.style.padding = '.5rem';
        
            const select = document.getElementById("request-type");
        
            select.style.border = "none";
            select.style.height = '44px';
            select.style.borderRadius = ".5rem";
            select.style.padding = "0 0.5rem";
            select.style.fontWeight = '500';
            select.addEventListener('focus', () => {
              // Set the "outline" property of the focused input element to "none"
              select.style.outline = 'none';
            });
            select.addEventListener('mouseenter', ()=>{
              select.style.backgroundColor = '#D9D9D9';
            })
            select.addEventListener('mouseleave', ()=>{
              select.style.backgroundColor =  '#fff'
            })
        
        
            const form = document.getElementById("query-form");
        
            form.style.display = "flex";
            form.style.flexDirection = "row";
            form.style.gap = "1rem";
            form.style.alignItems = "center";
            
        
            const input = document.getElementById("tool-input");
            input.style.height = '44px';
            input.style.borderRadius = '.5rem';
            input.style.border = "1px solid #5C5C62";
            input.style.width = "240px";
            input.addEventListener('focus', () => {
              // Set the "outline" property of the focused input element to "none"
              input.style.outline = 'none';
            });
        
            
        
            const submitBtn = document.getElementById("submit-btn");
        
            //style button
            submitBtn.style.borderRadius = '.5rem';
            submitBtn.style.backgroundColor =  '#202023';
            submitBtn.style.color = "#FFFFFF";
            submitBtn.style.fontWeight = '500';
            submitBtn.style.border = "none";
            submitBtn.style.height = '2.75rem';
            submitBtn.style.width = "9rem";
            // submitBtn.style.paddingLeft = '0.5rem';
            submitBtn.style.overflowWrap = "wrap";
            submitBtn.style.whiteSpace = "normal";
            //handle submiting data
            submitBtn.addEventListener('mouseenter', ()=>{
              submitBtn.style.backgroundColor = '#5C5C62';
            })
            submitBtn.addEventListener('mouseleave', ()=>{
              submitBtn.style.backgroundColor =  '#202023'
            })
            submitBtn.addEventListener('click', async(e)=> await handleSubmitRequest(e, selectedText) );
        
            select.addEventListener("change", ()=>{
              let value = select.options[select.selectedIndex].value;
        
              if(value==="respond"){
                //change value place holder for input
                input.removeAttribute("required")
                input.placeholder = "Please provide additional context"
                submitBtn.value = "Respond to This"
              }else{
                input.setAttribute("required", "")
                input.placeholder = "Add a title/subject of the email"
                submitBtn.value = "Save Email as Template"
              }
            })
          
          
            var selectTrigger = document.querySelector(".select_triger");
        
            selectTrigger.style.display = "flex";
            selectTrigger.style.height = "2.25rem";
            selectTrigger.style.padding = "0 0.875";
            selectTrigger.style.borderRadius = "0.4rem";
            selectTrigger.style.fontSize = "0.875rem";
            selectTrigger.style.fontWeight = "500";
            selectTrigger.style.gap = "0.5rem";
            selectTrigger.style.placeItems = "center";
            selectTrigger.style.background = "rgb(244 244 245)";
            selectTrigger.style.color = "rgb(82 82 91)";
            selectTrigger.style.transition = "0.15s ease-in-out";
            selectTrigger.style.transitionProperty = "background, color, opacity";
            selectTrigger.style.outline = "none";
            selectTrigger.style.border = "none";
        
            document.getElementById("close-btn").addEventListener("click", removeDiv)
          }
        
          const buttons = document.querySelectorAll('.div-btn');
        // loop through each button and apply styling
          buttons.forEach(button => {
            button.style.cursor = 'pointer';
          });
        }
      }
    }
  })
  .catch(error => {
    // User is not authenticated logic
    //do nothing
  });
}

async function handleCopyResponse (e) {
  const t = document.getElementById("reply-text").textContent;
  setTimeout((()=>{
    document.getElementById("copy-btn").innerHTML = `<p>Copy Again</p>
    <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 96 960 960" width="16">
      <path d="M200 976q-33 0-56.5-23.5T120 896V376q0-17 11.5-28.5T160 336q17 0 28.5 11.5T200 376v520h400q17 0 28.5 11.5T640 936q0 17-11.5 28.5T600 976H200Zm160-160q-33 0-56.5-23.5T280 736V256q0-33 23.5-56.5T360 176h360q33 0 56.5 23.5T800 256v480q0 33-23.5 56.5T720 816H360Zm0-80h360V256H360v480Zm0 0V256v480Z" transform="scale(0.66667) translate(12 72)"></path>
    </svg>`
  }), 3e3),
  copyToClipboard(t),
  document.getElementById("copy-btn").textContent = "Copied!"
};

function appendDiv(type, text){

  const container = document.getElementById("added-div")
  const div = document.createElement("div");
  div.setAttribute("id", "div-notifs");
  div.setAttribute("align", 'justify');
  
  div.style.backgroundColor = "#F4F5F8";
  div.style.padding = "0.5rem";
  div.style.fontSize = "14px";
  div.style.borderBottomRightRadius = "5px";
  div.style.borderBottomLeftRadius = "5px";
  div.style.height = '100px';
  div.style.overflow = 'auto';
  
  div.innerHTML = `
    <p id="reply-text">${text}</p>
    <div id="copied" style="display: none;">
      <p>✔️ Copied to your clipboard</p>
      <div id="copy-btn" class="copy-btn-cl">
        <p>Copy Again</p>
        <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 96 960 960" width="16">
          <path d="M200 976q-33 0-56.5-23.5T120 896V376q0-17 11.5-28.5T160 336q17 0 28.5 11.5T200 376v520h400q17 0 28.5 11.5T640 936q0 17-11.5 28.5T600 976H200Zm160-160q-33 0-56.5-23.5T280 736V256q0-33 23.5-56.5T360 176h360q33 0 56.5 23.5T800 256v480q0 33-23.5 56.5T720 816H360Zm0-80h360V256H360v480Zm0 0V256v480Z" transform="scale(0.66667) translate(12 72)"></path>
        </svg>              
      </div>
    </div>
  `;

  container.appendChild(div)
  container.style.display = ""

  if(type === 'respond'){
    const copyDiv = document.getElementById("copied");
    copyDiv.style.display = "flex";
    copyDiv.style.flexDirection = "row";
    copyDiv.style.alignItems = "center";
    copyDiv.style.justifyContent = "space-between";
    copyDiv.style.fontSize = "12px";

    //style the paragraph inside the copy div
    const elements = document.querySelectorAll('#copied > p');
    elements.forEach(element => {
      element.style.color = 'green';
      element.style.fontWeight = 'bold';
    });

    const copyBtn = document.getElementById("copy-btn");

    copyBtn.style.display = "flex";
    copyBtn.style.display = 'flex';
    copyBtn.style.justifyContent = 'center';
    copyBtn.style.alignItems = 'center';
    copyBtn.style.gap = '.5rem';
    copyBtn.style.height = '2.5rem';
    copyBtn.style.background = 'none';
    copyBtn.style.borderRadius = '5px';
    copyBtn.style.border = '1px solid #e1e3e1';
    copyBtn.style.padding = '0 .5rem';
    copyBtn.style.color = '#000';
    copyBtn.style.cursor = 'pointer';
    copyBtn.addEventListener("click", handleCopyResponse);
  }else{
    div.style.height = '50px';
    const replyNotif = document.getElementById("reply-text");
    replyNotif.style.color = "green";
  }
}
function removeInnerDiv(){
  const container = document.getElementById("added-div")
  const div = document.getElementById("div-notifs");
  
  container.removeChild(div)
}

function insertDiv() {
  var div = document.createElement("div");
  div.setAttribute("id", "added-div");
  div.style.display = "none";

  div.innerHTML = "<span></span><button id='close-btn' style='float: right; margin: 5px;'>Close</button>";
  document.body.appendChild(div);
}
function isAuthenticated() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("authToken", function(items) {
      const authToken = items.authToken;
      if (authToken) {
        // AuthToken exists, so user is authenticated
        resolve(true);
      } else {
        // AuthToken does not exist, so user is not authenticated
        reject(false);
      }
    });
  });
}

document.addEventListener("mouseup", async(e)=> await handleMouseUp(e));
insertDiv();
