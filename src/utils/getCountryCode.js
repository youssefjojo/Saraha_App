import axios from "axios"


export const getCountryCode = async (ip) => {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`)
    return response.data
}


