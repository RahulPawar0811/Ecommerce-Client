import axios from 'axios';

const baseURL = 'http://localhost:8080';
const imageURL = 'http://localhost:8080';
// const baseURL = 'https://admin.forscents.in';

// const imageURL = "https://admin.forscents.in";

const apiInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,           // Ensures cookies are sent with requests

});

export default apiInstance;

export const apiUrl = baseURL;
export {imageURL}
