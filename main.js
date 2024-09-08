// TO ENABLE YOUR RPC SERVER GO TO Cider > Setting > Connectivity then make sure "RPC Server" is enabled
// TO GET YOUR API KEY GO TO Cider > Setting > Connectivity > Manage External Application Access to Cider then generator a new key and paste it in the apiKey field below

const config = {
    apiKey: 'ay0be3kxzi9fvvuh4lekmav9', // MUST USE IF YOU REQIRE THEM FOR YOUR RPC SERVER
    
    urls: {
        host: 'http://127.0.0.1:10767',
        baseUri: '/api/v1/playback',
        active: '/active',
        nowPlaying: '/now-playing',
        isPlaying: '/is-playing',
        volume: '/volume'
    },

    displayWhenNotPlaying: true,
    
    songInfo: {
        display: true,
        title: true,
        artist: true,
        album: true,
        progress: true
    },

    artwork: true
}


async function makeRequest(uri) {
    let res = false

    await fetch(config.urls.host + config.urls.baseUri + uri, {
        method: 'GET',
        headers: {},
    })
    .then(response => response.json())
    .then(data => res = data)
    .catch(error => res = false)

    return res
}


async function checkActive() {
    const isActive = await makeRequest(config.urls.active)
    const isPlaying = await makeRequest(config.urls.isPlaying)

    if (isActive.status == 'ok' && isPlaying.status == 'ok' && isPlaying.is_playing) return true
    return false
}

function cutoffText(text, length) {
    if (text.length > length) return text.substring(0, length) + '...'
    return text
}

$('#container').hide()
$(document).ready(async function() {
    setInterval(async function() {
        const isActive = await checkActive()

        if (isActive) {
            console.log('Active')
            $('#container').show()
            const songTitle = $('#title')
            const songArtist = $('#artist')
            const songAlbum = $('#album')
            const songProgressBar = $('#progress-bar')
            const songArtwork = $('#artwork')

            const nowPlaying = await makeRequest(config.urls.nowPlaying)
            const [album, artist, artwork, title] = [nowPlaying.info.albumName, nowPlaying.info.artistName, nowPlaying.info.artwork, nowPlaying.info.name]
            const totalLength = nowPlaying.info.currentPlaybackTime + nowPlaying.info.remainingTime
            const progress = (nowPlaying.info.currentPlaybackTime / totalLength) * 100

            songTitle.text('Title: ' + cutoffText(title, 30))
            songArtist.text('Artist: ' + cutoffText(artist, 30))
            songAlbum.text('Album: ' + cutoffText(album, 30))
            songProgressBar.css('width', progress + '%')
            
            songArtwork.attr('src', artwork.url.replace('{h}', artwork.height).replace('{w}', artwork.width))
        } else if (config.displayWhenNotPlaying) {
            console.log('Not Active')
            $('#container').show()
            $('#title').text('Title: Not Playing')
            $('#artist').text('Artist: Not Playing')
            $('#album').text('Album: Not Playing')
            $('#progress-bar').css('width', '0%')
            $('#artwork').attr('src', 'https://via.placeholder.com/300')
        } else {
            console.log('Not Active, Hiding')
            $('#container').hide()
            $('#box').hide()
        }
    }, 250)
})