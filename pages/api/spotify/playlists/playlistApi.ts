// GET ALL PLAYLISTS
export async function playlistsFetch(token: string) {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    return data;
}

// GET PLAYLIST BY ID
export async function playlistFetch(token : string, playlist_id: string) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const data = await response.json();
    return data;
}