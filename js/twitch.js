mainTwitchHandler();

function mainTwitchHandler() {
    const urlParams = new URLSearchParams(window.location.search);
    const platform = urlParams.get('platform');
    if (platform !== 'twitch') {
        return;
    }
    
    let docHash = (document.location.hash).replace(/[^#]+#/, "").split("&");
    
    let firstItem = docHash[0].split('=');
    let accessToken = firstItem[1];
    
    let liveChannels = new Array();
    liveChannels = getUserId(accessToken)['data'] 
    let liveId = new Array();
    
    for (let i = 0; i < liveChannels.length; i++) {
        liveId.push(liveChannels[i]['user_login'])
    }
    
    document.cookie = `liveId=${JSON.stringify(liveId)}; expires=Thu, 01 Jan 2099 00:00:00 UTC`;
    
    console.log(liveId)
    channelButtons(liveId);
}




function getUserId(accessToken) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET',
        'https://api.twitch.tv/helix/users?client_id=b5ujmm9jumele7l1eghxn11gfboq41', false);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader("Client-Id", 'b5ujmm9jumele7l1eghxn11gfboq41')
    xhr.send();
    if (xhr.status != 200) {
        console.log('Error ' + xhr.status + ': ' + xhr.statusText);
    }
    let jsonParse = JSON.parse(xhr.response);
    let jsonData = jsonParse['data'];
    let userId = jsonData[0]['id'];

    xhr.open('GET',
        'https://api.twitch.tv/helix/streams/followed?user_id=' + userId, false);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader("Client-Id", 'b5ujmm9jumele7l1eghxn11gfboq41')
    xhr.send();
    if (xhr.status != 200) {
        console.log('Error ' + xhr.status + ': ' + xhr.statusText);
    } else {
        return JSON.parse(xhr.response);
    }
}


function createRow(context, id) {
    var row = document.createElement("div");
    row.className = "row leftrow";
    row.id = `row${id}`;
    context.appendChild(row);
};
function createButton(context, id, channel) {
    var button = document.createElement("button");
    button.type = "button";
    button.id = `btn${id}`;
    button.innerText = `${channel}`;
    button.className = "streamButtons gy-1"
    button.onclick = function () {
        var iframe = document.getElementById('stream-video');
        var iframeChat = document.getElementById('stream-chat');
        iframe.src = `https://player.twitch.tv/?channel=${channel}&parent=localhost`;
        iframeChat.src = `https://www.twitch.tv/embed/j${channel}/chat?parent=localhost`
    }
    context.appendChild(button);
};

function channelButtons(liveId) {
    for (let i = 0; i < liveId.length; i++) {
        if (liveId[i] !== undefined) {
            createRow(document.getElementById('leftmain'), i);
            createButton(document.getElementById(`row${i}`), i, liveId[i]);
        };
    }
};


