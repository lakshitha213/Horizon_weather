

export const GEO_API_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo";

export const geoApiOptions = {
  method: "GET",
  headers: {
    "x-rapidapi-key": '7aafc54f23mshbff4f725786ddb5p1f9440jsn3fef59bc6060',
    "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
  },
};

// Function to get distance between two places
export const getDistanceBetweenPlaces = async (fromPlaceId, toPlaceId = "Q60") => {
  try {
    const url = `${GEO_API_URL}/places/${fromPlaceId}/distance?toPlaceId=${toPlaceId}`;
    const response = await fetch(url, geoApiOptions);

    if (!response.ok) throw new Error("Failed to fetch distance.");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching distance:", error);
    return null;
  }
};
