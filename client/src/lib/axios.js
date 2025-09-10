import axios from 'axios'

export const axoiosInstance = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true,

});