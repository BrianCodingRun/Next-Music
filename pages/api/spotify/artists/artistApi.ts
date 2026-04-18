export async function artistFetch(token: string) {
    const response = await fetch('https://api.spotify.com/v1/me/following?type=artist', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();
    
    return data;
}