import axios from "axios";

// Base API URL - replace with your actual API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create an axios instance with default config
const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

export default api;
