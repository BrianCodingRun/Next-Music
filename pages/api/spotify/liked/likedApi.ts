export async function likedFetch(token: string) {
    const response = await fetch('https://api.spotify.com/v1/me/tracks?limit=50', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();

    return data
}