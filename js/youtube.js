let liveStreamsArr = [];
let channels = [];

async function getChannelTitle(accessToken, channelId) {
  const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=snippet&access_token=${accessToken}`);
  const responseData = await response.json();

  return responseData.items[0].snippet.title;
}

async function getLiveStreams(accessToken, channels) {
  const channelDataPromises = channels.map(channelId => {
    return getChannelTitle(accessToken, channelId).then((response) => ({channelId, title: response}));
  });
  const promises = channels.map(channelId => {
    return fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&channelId=${channelId}&access_token=${accessToken}`)
      .then(response => response.json())
      .then(data => ({
        liveStreams: data.items.map(item => item.snippet.title),
        channelId: channelId
      }))
      .then(result => {
        return result;
      });
  });
  let channelInfoMap = {};
  try {
    const channelDataResult = await Promise.all(channelDataPromises);
    channelInfoMap = channelDataResult.reduce((prev, curr) => ({...prev, [curr.channelId]: curr.title}), {});
  } catch (error) {
    console.log(error)
  }
  try {
    const result = await Promise.all(promises);
    const resultWithTitles = result.map(item => ({...item, channel: channelInfoMap[item.channelId]}));
    resultWithTitles.forEach(item => item.liveStreams.length > 0 ? liveStreamsArr.push(item) : {});
  } catch (error) {
    console.log(error)
  }
  
}


function getSubscriptions(accessToken, pageToken = '') {
  return fetch(`https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&pageToken=${pageToken}&access_token=${accessToken}`)
    .then(response => response.json())
    .then(data => {
      data.items.forEach(item => {
        channels.push(item.snippet.resourceId.channelId);
      });

      if (data.nextPageToken) {

        return getSubscriptions(accessToken, data.nextPageToken);
      } else {
        return getLiveStreams(accessToken, channels);
      }
    })
    .catch(error => console.log(error));
}

function getLiveStreamsFromSubscriptions(accessToken, pageToken) {
  return getSubscriptions(accessToken, pageToken);
}

async function anotherYtHandler() {
  let info = JSON.parse(localStorage.getItem('authInfo'));
  if (!info) {
    return;
  }
  if (!('access_token' in info)) {
    return;
  }
  const accessToken = info['access_token'];
  if (!accessToken) {
    return;
  }
  await getLiveStreamsFromSubscriptions(accessToken, '');
  channelButtons(liveStreamsArr)
  // console.log({HandleStreams: liveStreamsArr})


  // console.log(liveStreamsArr)
}

anotherYtHandler();


function createRow(context, id) {
  var row = document.createElement("div");
  row.className = "row leftrow";
  row.id = `row${id}`;
  context.appendChild(row);
};
function createButton(context, id, channelId, channel) {
  var button = document.createElement("button");
  button.type = "button";
  button.id = `btn${id}`;
  button.innerText = `${channel}`;
  button.className = "streamButtons gy-1"
  button.onclick = function(){
      var iframe = document.getElementById('stream-video');
      var iframeChat = document.getElementById('stream-chat');
      iframe.src = `https://www.youtube.com/embed/live_stream?channel=${channelId}`;
      iframeChat.src = `https://www.youtube.com/live_chat?channel=${channelId}&embed_domain=localhost:5500`
  }
  context.appendChild(button);
};

function channelButtons(liveStreamsArr) {
  for (let i = 0; i < liveStreamsArr.length; i++){
  createRow(document.getElementById('leftmain'), i);
  createButton(document.getElementById(`row${i}`), i, liveStreamsArr[i]['channelId'], liveStreamsArr[i]['channel']);
}
};


