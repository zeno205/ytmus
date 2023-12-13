const express = require('express');
const compression = require('compression');
const { type } = require('os');
const path = require('path');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');

const app = express();
const port = 3000;

app.use(express.json());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/search', async (req, res) => {
  // let filters1 = await ytsr.getFilters(req.body.keyword);
  // let filter1 = filters1.get('Type').get('Video');
  let options = {pages: 1}
  // playlist = [
  //   {title: "audio 2", url: "/audio/audio1.mp3", thumbnail: "/placeholder.png"},
  //   {title: "audio 1", url: "/audio/audio2.mp3", thumbnail: "/placeholder.png"}
  // ];
  await ytsr(req.body.keyword, options).then((result)=>{
    let playlist = [];
    let searchResult = result.items.filter((i)=>{return i["type"]==="video"});
    searchResult.forEach(element => {
      playlist.push({title: element.title, url: element.url, thumbnail: element.bestThumbnail["url"]})
    })
    console.log(playlist)
    res.send(JSON.stringify(playlist));
  }).catch((reason)=>{
    console.log(reason);
  })
})

app.post('/get_audio', async (req, res) => {
  let data;
  let filterURL;
  try {
    data = await ytdl.getInfo(req.body.url);
  } catch (err) {
    console.log(err);
    return;
  }

  try {
    filterURL = ytdl.chooseFormat(data.formats, {filter: "audioonly",quality: "highest"}).url;
    res.send(JSON.stringify(filterURL));
  } catch (err) {
    console.log(err);
    return;
  }
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
