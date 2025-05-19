import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL - replace with your actual API URL
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

// Async thunks for API calls
export const generateQuestions = createAsyncThunk(
	"interview/generateQuestions",
	async (interviewData, { rejectWithValue }) => {
		try {
			// Format the request body to match the backend's expected structure
			const requestBody = {
				job_title: interviewData.jobTitle || "",
				job_description: interviewData.jobDescription || "",
				background: interviewData.background || "",
				interview_type: interviewData.interviewType || "mixed",
				num_questions: interviewData.numQuestions || 5,
			};

			const response = await axios.post(
				`${API_URL}/generate-questions`,
				requestBody
			);
			return response.data; // No need to add background to response
		} catch (error) {
			return rejectWithValue(
				error.response?.data || "Failed to generate questions"
			);
		}
	}
);

export const rateAnswer = createAsyncThunk(
	"interview/rateAnswer",
	async ({ question, audioBlob }, { rejectWithValue, getState }) => {
		try {
			const state = getState();
			const summarizedJob = state.interview.summarizedJob;
			const summarizedBackground = state.interview.summarizedBackground; // Get summarized background from state

			const formData = new FormData();
			formData.append("answer", audioBlob);
			formData.append("question", question);
			formData.append("job_description", summarizedJob);
			formData.append("background", summarizedBackground); // Use summarized background

			const response = await axios.post(`${API_URL}/rate`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || "Failed to rate answer");
		}
	}
);

export const getSummary = createAsyncThunk(
	"interview/getSummary",
	async (feedbackItems, { rejectWithValue }) => {
		try {
			// Each feedback item should have rating, explanation, and suggestions
			const formattedFeedback = feedbackItems.map((item) => ({
				rating: item.rating,
				explanation: item.explanation,
				suggestions: item.suggestions,
			}));

			const response = await axios.post(`${API_URL}/summarize`, {
				feedback: formattedFeedback,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(
				error.response?.data || "Failed to generate summary"
			);
		}
	}
);

const initialState = {
	currentInterview: null,
	questions: [],
	currentQuestionIndex: 0,
	answers: [],
	summary: null,
	loading: false,
	error: null,
	summarizedJob: "", // Add this new field
	summarizedBackground: "", // Keep only this field for background info
};

const interviewSlice = createSlice({
	name: "interview",
	initialState,
	reducers: {
		setInterviewData: (state, action) => {
			state.currentInterview = action.payload;
		},
		nextQuestion: (state) => {
			// Ensure we don't go beyond the available questions
			if (state.currentQuestionIndex < state.questions.length - 1) {
				state.currentQuestionIndex += 1;
			}
		},
		resetInterview: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			// Generate Questions
			.addCase(generateQuestions.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(generateQuestions.fulfilled, (state, action) => {
				state.loading = false;
				state.questions = action.payload.questions || [];
				state.summarizedJob = action.payload.summarized_job || ""; // Store the summarized job
				state.summarizedBackground = action.payload.summarized_background || ""; // Store the summarized background
				state.currentInterview = {
					// Use the interview type from the request instead of the response
					interviewType: state.currentInterview?.interviewType || "mixed",
					numQuestions: action.payload.questions?.length || 5,
				};
				state.currentQuestionIndex = 0;
				state.answers = [];
				state.summary = null;
			})
			.addCase(generateQuestions.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Rate Answer
			.addCase(rateAnswer.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(rateAnswer.fulfilled, (state, action) => {
				state.loading = false;
				state.answers.push(action.payload);
			})
			.addCase(rateAnswer.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Get Summary
			.addCase(getSummary.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(getSummary.fulfilled, (state, action) => {
				state.loading = false;
				state.summary = action.payload;
			})
			.addCase(getSummary.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || "Failed to generate summary";
			});
	},
});

export const { setInterviewData, nextQuestion, resetInterview } =
	interviewSlice.actions;

export default interviewSlice.reducer;
