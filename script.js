const typingForm= document.querySelector(".typing-form")
const chatList=document.querySelector(".chat-list")
const toggleThemeButton=document.querySelector("#toggle-theme-button")

let userMessage=null

const loadLocalStorageData= ()=>{
    const isLightMode=(localStorage.getItem("themecolor")=== "light_mode")

    document.body.classList.toggle("light_mode", isLightMode)

    toggleThemeButton.innerText=isLightMode? "dark_mode" : "light_mode"
}

loadLocalStorageData()

const API_KEY="AIzaSyCX-LcbmoLXomw8-8rnkOoikVVfKEvpBWY"
const API_URL=`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const createMessageElement =(content,...classes)=>{
    const div=document.createElement("div")
    div.classList.add("message",...classes)
    div.innerHTML=content;
    return div;
}

const showTypingEffect=(text, textElement)=>{
    const words=text.split(' ');
    let  currentWordIndex=0;


    const typingInterval=setInterval(() =>{
        textElement.innerText+=(currentWordIndex === 0 ? '' :' ') + words[currentWordIndex++]

        if(currentWordIndex === words.length){
            clearInterval(typingInterval)
        }
    },75)
}

const generateAPIResponse= async (incomingMessageDiv)=>{

    const textElement=incomingMessageDiv.querySelector(".text")
    try{
        const response=await fetch(API_URL,{
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body:JSON.stringify({
                contents:[{
                    role:"user",
                    parts: [{text: userMessage}]
                }]
            })
        })

        const data=await response.json()

        const apiResponse=data?.candidates[0].content.parts[0].text
        showTypingEffect(apiResponse, textElement)
    }
    catch(error){
        console.log("error")
    }finally{
        incomingMessageDiv.classList.remove("loading")
    }

}

const showLoadingAnimation = () => {
    const html = `
        <div class="message-content">
            <img src="./images/gemini.svg" alt="User Image" class="avatar">
            <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span onclick="copyMessage(this)" class="icon material-symbols-rounded">
            content_copy
        </span>`;

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);

    generateAPIResponse(incomingMessageDiv);
}

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    
    // Check if the messageText is not empty
    if (messageText.trim() !== "") {
        navigator.clipboard.writeText(messageText).then(() => {
            copyIcon.innerText = "done";
            setTimeout(() => copyIcon.innerText = "content_copy", 1000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    } else {
        console.log("No text available to copy.");
    }
}


const handleOutgoingChat=()=>{
    userMessage=typingForm.querySelector(".typing-input").value.trim();
    if(!userMessage) return;

    const html=`<div class="message-content">
                <img src="./images/user.jpg" alt="User Image" class="avatar">
                <p class="text"></p>
            </div>`

        const outGoingMessageDiv=createMessageElement(html,"outgoing")
        outGoingMessageDiv.querySelector(".text").innerText=userMessage
        chatList.appendChild(outGoingMessageDiv)

        typingForm.reset()
        setTimeout(showLoadingAnimation,500);
}

toggleThemeButton.addEventListener("click",()=>{
    const isLightMode=document.body.classList.toggle("light-mode")
    localStorage.setItem("themecolor", isLightMode? "light_mode":"dark_mode")
    toggleThemeButton.innerText=isLightMode? "dark_mode" : "light_mode"
})

typingForm.addEventListener("submit",(e)=>{
    e.preventDefault()

    handleOutgoingChat()
})