import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { rateAnswer, getSummary } from "../store/slices/interviewSlice";
import colors from "../theme/colors";
import Button from "./common/Button";

function InterviewSimulation({ interviewData, onComplete }) {
	const dispatch = useDispatch();
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [isRecording, setIsRecording] = useState(false);
	const [audioBlob, setAudioBlob] = useState(null);
	const [recordingTime, setRecordingTime] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [answers, setAnswers] = useState([]);
	const [currentFeedback, setCurrentFeedback] = useState(null);
	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);
	const timerRef = useRef(null);

	// Get questions and loading state from Redux store
	const { questions, loading } = useSelector((state) => state.interview);

	// Get interview type and total questions
	const interviewType = interviewData?.interviewType || "mixed";
	const numQuestions = questions?.length || 5;
	const currentQuestion = currentQuestionIndex + 1;

	// Clean up timer on unmount
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			stopRecording();
		};
	}, []);

	// Get the current question from Redux
	const getCurrentQuestion = () => {
		if (questions && questions.length > currentQuestionIndex) {
			return questions[currentQuestionIndex];
		}
		return "Loading question...";
	};

	const startRecording = async () => {
		try {
			// Reset audio chunks and feedback
			audioChunksRef.current = [];
			setCurrentFeedback(null);

			// Request microphone access
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			// Create media recorder
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;

			// Set up event handlers
			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = async () => {
				// Create blob from recorded chunks
				const audioBlob = new Blob(audioChunksRef.current, {
					type: "audio/webm",
				});
				setAudioBlob(audioBlob);

				// Stop all tracks in the stream
				stream.getTracks().forEach((track) => track.stop());

				// Clear timer
				if (timerRef.current) {
					clearInterval(timerRef.current);
					timerRef.current = null;
				}

				// Submit the answer for rating
				await submitAnswerForRating(audioBlob);
			};

			// Start recording
			mediaRecorder.start();
			setIsRecording(true);
			setRecordingTime(0);

			// Start timer
			timerRef.current = setInterval(() => {
				setRecordingTime((prev) => prev + 1);
			}, 1000);
		} catch (error) {
			console.error("Error accessing microphone:", error);
			alert(
				"Could not access microphone. Please check your browser permissions."
			);
		}
	};

	const stopRecording = () => {
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state === "recording"
		) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
		}
	};

	const toggleRecording = () => {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	const submitAnswerForRating = async (blob) => {
		setIsSubmitting(true);
		try {
			const question = getCurrentQuestion();
			const resultAction = await dispatch(
				rateAnswer({
					question,
					audioBlob: blob,
				})
			);

			if (resultAction.payload) {
				// Debug the structure of the payload
				console.log("API Response Payload:", resultAction.payload);

				// Extract the evaluation data from the payload
				// The updated API returns { question, answer, raw_answer, evaluation }
				// where evaluation contains the rating, explanation, and suggestions
				const feedbackData = resultAction.payload.evaluation
					? {
							answer: resultAction.payload.answer,
							rating: resultAction.payload.evaluation.rating,
							explanation: resultAction.payload.evaluation.explanation,
							suggestions: resultAction.payload.evaluation.suggestions,
					  }
					: resultAction.payload; // Fallback to old structure if evaluation is not present

				console.log("Processed Feedback Data:", feedbackData);
				setCurrentFeedback(feedbackData);

				// Store the answer with feedback
				const newAnswers = [...answers];
				newAnswers[currentQuestionIndex] = {
					question: question,
					audioBlob: blob,
					feedback: feedbackData,
				};
				setAnswers(newAnswers);
			} else if (resultAction.error) {
				console.error("Error rating answer:", resultAction.error);
				alert("Failed to rate your answer. Please try again.");
			}
		} catch (error) {
			console.error("Error submitting answer for rating:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60)
			.toString()
			.padStart(2, "0");
		const secs = (seconds % 60).toString().padStart(2, "0");
		return `${mins}:${secs}`;
	};

	const handleNextQuestion = () => {
		// Reset state for next question
		setAudioBlob(null);
		setCurrentFeedback(null);

		// Move to next question or complete
		if (currentQuestion < numQuestions) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		} else {
			// Get all feedback items for summary
			// Make sure we're extracting the correct feedback structure
			const feedbackItems = answers.map((answer) => {
				// Ensure we have the correct structure for the summary
				return (
					answer.feedback || {
						rating: 0,
						explanation: "No evaluation available.",
						suggestions: "No suggestions available.",
					}
				);
			});

			// Dispatch getSummary action
			dispatch(getSummary(feedbackItems));

			// Immediately complete the interview with all answers and feedback
			onComplete({
				interviewType,
				numQuestions,
				answers: answers.map((answer) => ({
					question: answer.question,
					audioUrl: answer.audioBlob
						? URL.createObjectURL(answer.audioBlob)
						: null,
					feedback: answer.feedback,
				})),
			});
		}
	};

	// Determine if the Next Question button should be disabled
	const isNextButtonDisabled = !currentFeedback || loading;

	// Render rating stars
	const renderRatingStars = (rating) => {
		// Add safety check for undefined or null rating
		if (rating === undefined || rating === null) {
			console.warn("Rating is undefined or null");
			rating = 0;
		}

		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;

		for (let i = 1; i <= 10; i++) {
			if (i <= fullStars) {
				stars.push(
					<span key={i} className="text-yellow-500">
						★
					</span>
				);
			} else if (i === fullStars + 1 && hasHalfStar) {
				stars.push(
					<span key={i} className="text-yellow-500">
						★
					</span>
				);
			} else {
				stars.push(
					<span key={i} className="text-gray-300">
						★
					</span>
				);
			}
		}

		return (
			<div className="flex">
				{stars}
				<span className="ml-2 font-bold">{rating}/10</span>
			</div>
		);
	};

	return (
		<div
			className="w-full max-w-3xl mx-auto p-4 sm:p-6 rounded-lg"
			style={{ backgroundColor: colors.softWhite, borderRadius: "1rem" }}
		>
			<h1
				className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6"
				style={{ color: colors.charcoal }}
			>
				Interview in Progress
			</h1>

			<div className="mb-4 text-center">
				<p className="text-lg font-semibold" style={{ color: colors.charcoal }}>
					Question {currentQuestion}/{numQuestions}
				</p>
				<p className="text-sm text-gray-500">
					{interviewType.charAt(0).toUpperCase() + interviewType.slice(1)}{" "}
					Interview
				</p>
			</div>

			<div
				className="rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 text-left shadow-md"
				style={{
					backgroundColor: "white",
					borderLeft: `4px solid ${colors.sage}`,
				}}
			>
				<h2
					className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3"
					style={{ color: colors.charcoal }}
				>
					Question:
				</h2>
				<p style={{ color: colors.charcoal, fontSize: "1.1rem" }}>
					{getCurrentQuestion()}
				</p>
			</div>

			<div>
				<div className="mb-2 text-center">
					{isRecording && (
						<div className="flex items-center justify-center gap-2 mb-2">
							<div
								className="w-3 h-3 rounded-full animate-pulse"
								style={{ backgroundColor: colors.accent }}
							></div>
							<p className="font-medium" style={{ color: colors.charcoal }}>
								Recording{" "}
								<span className="font-mono">{formatTime(recordingTime)}</span>
							</p>
						</div>
					)}
					{audioBlob && !isRecording && (
						<div className="mb-4">
							{isSubmitting ? (
								<p className="font-medium mb-2 text-gray-500">
									Analyzing your answer...
								</p>
							) : currentFeedback ? (
								<p
									className="font-medium mb-2 italic"
									style={{ color: colors.sage }}
								>
									{currentFeedback.answer}
								</p>
							) : (
								<p className="font-medium mb-2" style={{ color: colors.sage }}>
									Recording complete
								</p>
							)}
							<audio
								controls
								src={URL.createObjectURL(audioBlob)}
								className="mx-auto"
								style={{
									borderRadius: "0.5rem",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							/>
						</div>
					)}
					{!audioBlob && !isRecording && (
						<p className="text-sm text-gray-500 mb-2">
							Click the microphone to record your answer
						</p>
					)}
				</div>

				<div className="mb-6 sm:mb-8 flex justify-center">
					{!audioBlob ? (
						<button
							onClick={toggleRecording}
							className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl"
							style={{
								backgroundColor: isRecording ? colors.sage : colors.accent,
								color: "white",
								transform: "scale(1)",
							}}
							onMouseDown={(e) =>
								(e.currentTarget.style.transform = "scale(0.95)")
							}
							onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
						>
							{isRecording ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-8 w-8 sm:h-10 sm:w-10"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<rect x="6" y="6" width="12" height="12" strokeWidth={2} />
								</svg>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-8 w-8 sm:h-10 sm:w-10"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
									/>
								</svg>
							)}
						</button>
					) : (
						<button
							onClick={toggleRecording}
							disabled={isSubmitting}
							className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl ${
								isSubmitting ? "opacity-50 cursor-not-allowed" : ""
							}`}
							style={{
								backgroundColor: colors.accent,
								color: "white",
								transform: "scale(1)",
							}}
							onMouseDown={(e) =>
								!isSubmitting &&
								(e.currentTarget.style.transform = "scale(0.95)")
							}
							onMouseUp={(e) =>
								!isSubmitting && (e.currentTarget.style.transform = "scale(1)")
							}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 sm:h-10 sm:w-10"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
								/>
							</svg>
						</button>
					)}
				</div>

				{/* Feedback section */}
				{currentFeedback && (
					<div className="mb-6 p-4 rounded-lg bg-white shadow-md">
						<h3
							className="text-xl font-semibold mb-2"
							style={{ color: colors.charcoal }}
						>
							Feedback
						</h3>

						<div className="mb-3">
							{renderRatingStars(currentFeedback.rating)}
						</div>

						<div className="mb-3">
							<h4 className="font-semibold" style={{ color: colors.sage }}>
								Evaluation:
							</h4>
							<p>{currentFeedback.explanation || "No evaluation available."}</p>
						</div>

						<div>
							<h4 className="font-semibold" style={{ color: colors.accent }}>
								Suggestions:
							</h4>
							<p>
								{currentFeedback.suggestions || "No suggestions available."}
							</p>
						</div>
					</div>
				)}

				{/* Next Question button - only enabled after feedback is received */}
				<div className="flex justify-center mt-6">
					<Button
						onClick={handleNextQuestion}
						disabled={isNextButtonDisabled}
						className="w-full sm:w-auto"
						bgColor={colors.morningMist}
						textColor={colors.charcoal}
					>
						{currentQuestion < numQuestions
							? "Next Question"
							: "Complete Interview"}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default InterviewSimulation;
