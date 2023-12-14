const s = (str)=>{return document.querySelector(str)}
const toggle = (obj) => {obj.style.display !== "none" ? obj.style.display="none" : obj.style.display="block"}
const displayItem = (obj) => {obj.style.display = "block"}
const hideItem = (obj) => {obj.style.display = "none"}
let playlistItems = []
let originalPlaylistItems = [] // To store the original playlist
let isShuffling = false
let currentSongIndex = 0 // To keep track of the currently playing song
// let value

let item
const playlist_button = s("#playlist_button")
const playlist = s("#playlist")
const search_results_button = s("#search_results_button")
const search_list = s("#search_list")
const search_bar = s("#search_bar")
const search_button = s("#search_button")
const audio = s("#audio")
// let db

playlist_button.onclick = ()=>{toggle(playlist)}
search_results_button.onclick = ()=>{toggle(search_list)}
s("#loop_button").onclick = function() {
    audio.loop = !audio.loop
    isShuffling = false
}

s("#shuffle_button").onclick = function() {
    isShuffling = !isShuffling
    audio.loop = false
}

s("#sequential_button").onclick = function() {
    audio.loop = false
    isShuffling = false
    // Refill the playlist starting from the currently playing song
    playlistItems = originalPlaylistItems.slice(currentSongIndex)
}
search_button.onclick = () => {
    search_button.disabled = true;
    s("#loader").style.display="inline-block"
    fetch("/search", {
        method: "POST",
        headers:{"content-type": "application/json"},
        body:JSON.stringify({keyword:search_bar.value})
    })
    .then((data)=>data.json())
    .then((val)=>{
        search_list.innerHTML = ""
        val.forEach(element => {
            let li = document.createElement('li');
            let boundFunction = addToPlaylist.bind(li, element.url, element.title, element.thumbnail);
            li.onclick = function () {
                boundFunction();
            }; let img = document.createElement('img');
            img.src = element.thumbnail;
            img.style.width = '40vh';
            img.loading = 'lazy';
            li.appendChild(img);
            let span = document.createElement('span');
            span.textContent = element.title;
            li.appendChild(span);
            search_list.appendChild(li);
        });
        displayItem(search_list)
        hideItem(playlist)
        search_button.disabled = false
        s("#loader").style.display = "none"
    })
}
// function loadPlaylist() {
//     // Retrieve the playlist from IndexedDB
//     let objectStore = db.transaction("playlist").objectStore("playlist");

//     objectStore.openCursor().onsuccess = function (event) {
//         let cursor = event.target.result;
//         if (cursor) {
//             originalPlaylistItems.push(cursor.value);
//             cursor.continue();
//         }
//         else {
//         console.log("No more entries!");
//         // Update the UI here after the playlist has been fully loaded
//         updatePlaylistUI();
//       }
//     };
// }

// window.onload = ()=>{
//     let request = indexedDB.open("playlistDB");
//     request.onerror = function(event) {
//         console.log("Your browser does not support IndexDB. Playlists will not be saved");
//     };
//     request.onsuccess = function(event) {
//     db = event.target.result;
//         loadPlaylist();  // Call the function here
//     };
// }

async function addToPlaylist(url, title, thumbnail){
    this.classList.add('disabled');
    let response = await fetch('/get_audio',{
        method: "POST",
        headers:{"content-type": "application/json"},
        body:JSON.stringify({url: url})
    })
    let audio_link = await response.json()
    let song = {url: audio_link, title: title, thumbnail: thumbnail}
    // Check if the song already exists in the playlist
    // let songExists = originalPlaylistItems.some(existingSong => existingSong.url === song.url);

    // if (!songExists) {
        // If the song doesn't exist, add it to the playlist
        playlistItems.push(song)
        originalPlaylistItems.push(song) // Add to original playlist array

        // let request = db.transaction(["playlist"], "readwrite")
        // .objectStore("playlist")
        // .add(song);
        // request.onsuccess = function(event) {
        //     console.log("Song has been added to your database.");
        // };
        // request.onerror = function(event) {
        //     console.log("Unable to add data\r\nSong is aready exist in your database! ");
        // }
        this.classList.remove('disabled');
        let li = document.createElement('li');
        li.onclick = function () {
            play(audio_link, originalPlaylistItems.length - 1);
        };
        let img = document.createElement('img');
        img.src = thumbnail;
        img.style.width = '20vh';
        img.loading = 'lazy';
        li.appendChild(img);
        let span = document.createElement('span');
        span.textContent = title;
        li.appendChild(span);
        playlist.appendChild(li);
        hideItem(search_list)
        displayItem(playlist)
    // } else {
    //     console.log("Song already exists in the playlist.");
    // }
}

function play(url, index){
    audio.src=url
    audio.load()
    audio.play()
    currentSongIndex = index // Update the currently playing song index
    highlightCurrentSong()
}

function updatePlaylistUI() {
    // Clear the current UI
    playlist.innerHTML = "";

    // Add each song in the playlist to the UI
    originalPlaylistItems.forEach((song, index) => {
        let li = document.createElement('li');
        li.onclick = function () {
            play(song.url, index);
        };
        let img = document.createElement('img');
        img.src = song.thumbnail;
        img.style.width = '20vh';
        img.loading = 'lazy';
        li.appendChild(img);
        let span = document.createElement('span');
        span.textContent = song.title;
        li.appendChild(span);
        playlist.appendChild(li);

    });

    // Highlight the currently playing song
}
function highlightCurrentSong() {
    let playlistItems = document.querySelectorAll("#playlist li");
    // Remove highlight from all songs
    playlistItems.forEach((item, index) => {
        let highlightSpan = item.querySelector('.highlight');
        if (highlightSpan) {
            item.removeChild(highlightSpan);
        }
    });
    // Add highlight to the current song
    let currentSongItem = playlistItems[currentSongIndex];
    let highlightSpan = document.createElement('span');
    highlightSpan.className = 'highlight';
    highlightSpan.textContent = "🎵 ";
    currentSongItem.insertBefore(highlightSpan, currentSongItem.firstChild);
}

audio.addEventListener('ended', function () {
    if (!audio.loop) {
        // If shuffle is enabled, play a random song
        if (isShuffling) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * originalPlaylistItems.length);
            } while (randomIndex === currentSongIndex);
            play(originalPlaylistItems[randomIndex].url, randomIndex);
        } else {
            // Otherwise, play the next song
            currentSongIndex = (currentSongIndex + 1) % originalPlaylistItems.length;
            play(originalPlaylistItems[currentSongIndex].url, currentSongIndex);
        }
    }
});
s("#clear_playlist_button").onclick = () => {
    // var db = indexedDB.open("playlistDB");

    // db.onsuccess = function(event) {
    //     var transaction = db.result.transaction(["playlist"], "readwrite");
    //     var objectStore = transaction.objectStore("playlist");
    //     var request = objectStore.clear();

    //     request.onsuccess = function(event) {
            console.log("Playlist cleared successfully.");
            playlist.innerHTML=""
            audio.src=""
            audio.load()
    originalPlaylistItems = []
        // };
    // };

    // db.onerror = function(event) {
    //     console.log("Unable to clear playlist.");
    // };
}
