const { AssetCache } = require("@11ty/eleventy-cache-assets");
const axios = require("axios");

module.exports = async function() {

    let API_KEY = "AIzaSyDqzjJyo0KGZMijc9qfkK0bSAKe8EXXRUs";
    let PLAYLIST_ID = "PLMHFzBOAmrF4OQeMi4-jB8zn8qBc1U1qO";

    let baseUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&part=contentDetails,snippet&playlistId=${PLAYLIST_ID}&maxResults=50`;

    let asset = new AssetCache("youtube");

    if(asset.isCacheValid("1d")) {
        return asset.getCachedValue();
    }

    const getYouTubeVideos = async (nextPageToken) => {
        const url = nextPageToken != "" ? baseUrl + "&pageToken=" + nextPageToken : baseUrl;
        const response = await axios({
            "method": "GET",
            "url": url
        });
        const data = response.data;
        let cleanData = data.items.map(item => {
            return {
                "title": item.snippet.title,
                "url": "https://www.youtube.com/watch?v=" + item["contentDetails"]["videoId"],
                "thumbnail": item.snippet.thumbnails.medium.url
            }
        });
        if(data.nextPageToken && data.nextPageToken != "") {
            return cleanData.concat(await getYouTubeVideos(data.nextPageToken));
        } else {
            return cleanData;
        }
    }

    const videos = await getYouTubeVideos("");

    await asset.save(videos, "json");

    return videos;

};