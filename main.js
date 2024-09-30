// Please disable CORS in your browser to allow this to work.
// Please disable security in your Cider App 2.0 client for this to work.

const config = {
    autoDetect: true,
    ciderOnly: false,
    ytmdOnly: false,

    cider: {
        urls: {
            host: 'http://127.0.0.1:10767',
            baseUri: '/api/v1/playback',
            active: '/active',
            nowPlaying: '/now-playing',
            isPlaying: '/is-playing',
            volume: '/volume'
        },
    },

    ytmd: {
        appId: 'localhost.ytmd.currently-playing',

        urls: {
            host: 'http://127.0.0.1:9863',
            baseUri: '/api/v1',
            requestCode: '/auth/requestcode',
            request: '/auth/request',
            state: '/state',
        }
    },
    
    displayWhenNotPlaying: false,
    
    songInfo: {
        display: true,
        title: true,
        artist: true,
        album: true,
        progress: true
    },

    artwork: true
}

class Cider {
    async makeRequest(uri) {
        let res = false
    
        await fetch(config.cider.urls.host + config.cider.urls.baseUri + uri, {
            method: 'GET',
            headers: {},
        })
        .then(response => response.json())
        .then(data => res = data)
        .catch(error => res = false)
    
        return res
    }

    async checkActive() {
        const isActive = await makeRequest(config.cider.urls.active)
        const isPlaying = await makeRequest(config.cider.urls.isPlaying)
    
        if (isActive.status == 'ok' && isPlaying.status == 'ok' && isPlaying.is_playing) return true
        return false
    }
}

class YTMD {
    appID;
    code;
    token;

    constructor() {
        this.appID = config.ytmd.appId
    }

    authorize() {

    }

    getToken() {

    }



}

function cutoffText(text, length) {
    if (text.length > length) return text.substring(0, length) + '...'
    return text
}

$('#container').hide()
$(document).ready(async function() {
    const cider = new Cider()
    // const ytmd = new YTMD()

    const startCider = () => setInterval(async function() {
        const isActive = await checkActive()

        if (isActive) {
            console.log('Active')
            $('#container').show()
            const songTitle = $('#title')
            const songArtist = $('#artist')
            const songAlbum = $('#album')
            const songProgressBar = $('#progress-bar')
            const songArtwork = $('#artwork')

            const nowPlaying = await makeRequest(config.cider.urls.nowPlaying)
            const [album, artist, artwork, title] = [nowPlaying.info.albumName, nowPlaying.info.artistName, nowPlaying.info.artwork, nowPlaying.info.name]
            const totalLength = nowPlaying.info.currentPlaybackTime + nowPlaying.info.remainingTime
            const progress = (nowPlaying.info.currentPlaybackTime / totalLength) * 100

            songTitle.text('Title: ' + cutoffText(title, 30))
            songArtist.text('Artist: ' + cutoffText(artist, 30))
            songAlbum.text('Album: ' + cutoffText(album, 30))
            songProgressBar.css('width', progress + '%')
            
            songArtwork.attr('src', artwork.url.replace('{h}', artwork.height).replace('{w}', artwork.width))
        } else if (config.cider.displayWhenNotPlaying) {
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
    }, 100)

    const startYTMD = () => {

    }


    if (config.autoDetect) {

    } else if (config.ciderOnly) {
        startCider()
    } else if (config.ytmdOnly) {

    }

})