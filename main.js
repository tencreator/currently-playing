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
        appId: 'xyz.tencreator.ytmd.currently-playing',

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

function cutoffText(text, length) {
    if (text.length > length) return text.substring(0, length) + '...'
    return text
}

function updateDetails(title, artist, album, artwork, progress) {
    title = cutoffText(title, 30)
    artist = cutoffText(artist, 30)
    album = cutoffText(album, 30)

    $('#title').text('Title: ' + title)
    $('#artist').text('Artist: ' + artist)
    $('#album').text('Album: ' + album)

    $('#progress-bar').css('width', progress + '%')

    $('#artwork').attr('src', artwork)
}

function require(url, integrity) {
    var script = document.createElement('script')
    script.src = url
    script.integrity = integrity
    script.crossOrigin = 'anonymous'
    document.getElementsByTagName('head')[0].appendChild(script)
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
    token;

    constructor() {
        this.appID = config.ytmd.appId
        this.token = localStorage.getItem('ytmd_token')

        if (!this.token) this.authorize()
        else this.connect()
    }

    async authorize() {
        const code = await (async function() {
            try {
                const res = await fetch(config.ytmd.urls.host + config.ytmd.urls.baseUri + config.ytmd.urls.requestCode, {
                    method: 'POST',
                    body: JSON.stringify({
                        appId: this.appID,
                        appName: 'TenCretor\'s YTMD OBS Overlay',
                        appVersion: '0.0.0-beta',
                    })
                })
    
                const data = await res.json()
                return data.code
            } catch (e) {
                return alert('An error occurred while authorizing YTMD. Please make sure that you have YTMD installed, running and you have the Companion server enabled and try again later.')
            }
        }())

        const token = await (async function() {
            const res = await fetch(config.ytmd.urls.host + config.ytmd.urls.baseUri + config.ytmd.urls.request, {
                method: 'POST',
                body: JSON.stringify({
                    appId: this.appID,
                    code: code
                })
            })

            const data = await res.json()
            return data.token
        }())

        localStorage.setItem('ytmd_token', token)
        this.token = token
        // this.connect()
    }

}

$('#container').hide()
$(document).ready(async function() {
    const startCider = (cider) => setInterval(async function() {
        const isActive = await cider.checkActive()

        if (isActive) {
            console.log('Active')
            $('#container').show()
            const nowPlaying = await cider.makeRequest(config.cider.urls.nowPlaying)
            if (!nowPlaying) return
            const [album, artist, artwork, title] = [nowPlaying.info.albumName, nowPlaying.info.artistName, nowPlaying.info.artwork, nowPlaying.info.name]
            const totalLength = nowPlaying.info.currentPlaybackTime + nowPlaying.info.remainingTime
            const progress = (nowPlaying.info.currentPlaybackTime / totalLength) * 100

            updateDetails(title, artist, album, artwork.url.replace('{h}', artwork.height).replace('{w}', artwork.width), progress)

        } else if (config.cider.displayWhenNotPlaying) {
            console.log('Not Active')
            $('#container').show()

            updateDetails('Not Playing', 'Not Playing', 'Not Playing', 'https://via.placeholder.com/300', 0)

        } else {
            console.log('Not Active, Hiding')
            $('#container').hide()
            $('#box').hide()
        }
    }, 100)

    const startYTMD = (ytmd) => {

    }


    if (config.autoDetect) {

    } else if (config.ciderOnly) {
        const cider = new Cider()
        startCider(cider)
    } else if (config.ytmdOnly) {
        require('https://cdn.socket.io/4.7.4/socket.io.min.js', 'sha384-Gr6Lu2Ajx28mzwyVR8CFkULdCU7kMlZ9UthllibdOSo6qAiN+yXNHqtgdTvFXMT4')
        const ytmd = new YTMD()
        startYTMD(ytmd)
    }

})