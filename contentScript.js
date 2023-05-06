console.log('content script loaded');

function getSelectedHtml() {
  var range = window.getSelection().getRangeAt(0);
  var container = document.createElement("div");
  container.appendChild(range.cloneContents());
  return container.innerHTML;
}

function removeDiv(event) {
  console.log('removing div');
  var div = document.getElementById("added-div");
  div.style.display = "none";

}
let dropDownValue = "Upload";

function handleMouseUp (event) {
  var selectedText = window.getSelection().toString();
  var range = window.getSelection().getRangeAt(0);
  const parentElement = range.commonAncestorContainer.parentElement;

  var rect = range.getBoundingClientRect();
  
  const isClickInside = parentElement.contains(event.target);

  if (selectedText !== "" && isClickInside) {
    const div = document.getElementById("added-div");

    div.style.display = "flex";
    div.style.position = "absolute";
    div.style.padding = '.5rem';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'space-between';
    div.style.top = rect.bottom + "px";
    div.style.left = rect.left + "px";
    div.style.position = "absolute";
    div.style.color = '#27272A';
    div.style.borderRadius = '5px';
    div.style.gap = "1rem";
    // div.style.width = "400px";
    div.style.height = "54px"
    div.style.zIndex = 10;
    div.style.backgroundColor = 'rgb(244 244 245)';
    div.style.fontFamily = 'Lato, sans-serif';


    div.innerHTML = `<button type="button" role="combobox" aria-controls="radix-:rr:" aria-expanded="false" aria-autocomplete="none" dir="ltr" data-state="closed" class="select_triger div-btn">
    <select name="requests" id="request-type">
    <option value="upload">Upload</option>
    <option value="respond">Respond</option>
    </select>
      
      </button>
      <input type="text" id="tool-input" placeholder="Add a title/subject of the email">
      </input>
      <button id="submit-query" class="div-btn" >Save Email as Template</button>
      <div id="close-btn" class="div-btn">
        <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 96 960 960" width="16">
          <path d="M480 632 284 828q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536 576l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480 632Z"/>
        </svg>          
      </div>`;

  const select = document.getElementById("request-type");

  select.style.border = "none";
  select.style.height = '44px';
  select.style.borderRadius = ".5rem";
  select.style.padding = "0 0.5rem";
  select.addEventListener('focus', () => {
    // Set the "outline" property of the focused input element to "none"
    select.style.outline = 'none';
  });
  

  const input = document.getElementById("tool-input");
  input.style.height = '44px';
  input.style.borderRadius = '.5rem';
  input.style.border = "1px solid #5C5C62";
  input.style.width = "240px";
  input.addEventListener('focus', () => {
    // Set the "outline" property of the focused input element to "none"
    input.style.outline = 'none';
  });


    const submitBtn = document.getElementById("submit-query");

    submitBtn.style.height = '44px';
    submitBtn.style.borderRadius = '.5rem';
    submitBtn.style.backgroundColor = '#272829';
    submitBtn.style.color = "#FFFFFF";
    submitBtn.style.fontWeight = '700';
    submitBtn.style.border = "none";
    submitBtn.style.width = "140px";
    submitBtn.style.paddingLeft = '0.5rem';
    submitBtn.style.overflowWrap = "wrap";

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
document.addEventListener("mouseup", handleMouseUp);

function insertDiv() {
  var div = document.createElement("div");
  div.setAttribute("id", "added-div");
  div.style.display = "none";

  div.innerHTML = "<span>Hello, this is a message!</span><button id='close-btn' style='float: right; margin: 5px;'>Close</button>";
  document.body.appendChild(div);
}
insertDiv();