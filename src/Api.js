import axios from "axios";
const BASE_URL = "https://tictactoe-b.onrender.com";
 
const api = axios.create({
    baseURL: BASE_URL,
});




const apiEndpoints = {
   
};

export { api, apiEndpoints };
