import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateQuestions } from "../store/slices/interviewSlice";
import colors from "../theme/colors";

function InterviewSetup({ onStart }) {
	const dispatch = useDispatch();
	const { loading, error } = useSelector((state) => state.interview);

	const [formData, setFormData] = useState({
		jobTitle: "",
		jobDescription: "",
		background: "",
		interviewType: "mixed", // Default to "mixed"
		numQuestions: 5, // Default to 5 questions
	});

	const [errors, setErrors] = useState({});

	// Clear any existing errors when component mounts
	useEffect(() => {
		// You can add a reset action if needed
		console.log("InterviewSetup component mounted");
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;

		// For numQuestions, ensure it's a number and within range
		if (name === "numQuestions") {
			const numValue = parseInt(value, 10);
			setFormData({
				...formData,
				[name]: numValue ? Math.min(Math.max(numValue, 1), 20) : value,
			});
		} else {
			setFormData({
				...formData,
				[name]: value,
			});
		}

		// Clear error for this field if it exists
		if (errors[name]) {
			setErrors({
				...errors,
				[name]: null,
			});
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log("Form submitted", formData);

		// Validate form
		const newErrors = {};
		if (!formData.jobTitle.trim()) {
			newErrors.jobTitle = "Job title is required";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			console.log("Validation errors:", newErrors);
			return;
		}

		console.log("Dispatching generateQuestions action");
		// Dispatch the generateQuestions action
		try {
			const resultAction = await dispatch(generateQuestions(formData));
			console.log("Action result:", resultAction);

			// If successful, move to the interview
			if (!resultAction.error) {
				console.log("Starting interview with:", formData);
				onStart(formData);
			}
		} catch (err) {
			console.error("Error dispatching action:", err);
		}
	};

	// Format error message to ensure it's a string
	const getErrorMessage = () => {
		if (!error) return null;

		if (typeof error === "string") {
			return error;
		}

		if (error.detail) {
			return typeof error.detail === "string"
				? error.detail
				: JSON.stringify(error.detail);
		}

		return JSON.stringify(error);
	};

	console.log("Current state - loading:", loading, "error:", error);

	return (
		<div
			className="w-full max-w-3xl mx-auto p-4 sm:p-6 rounded-lg"
			style={{ backgroundColor: colors.softWhite, borderRadius: "1rem" }}
		>
			<h1
				className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6"
				style={{ color: colors.charcoal }}
			>
				Setup Your Interview
			</h1>

			<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
				<div>
					<label
						htmlFor="jobTitle"
						className="block text-sm font-medium mb-1"
						style={{ color: colors.charcoal }}
					>
						Job Title*
					</label>
					<input
						type="text"
						id="jobTitle"
						name="jobTitle"
						value={formData.jobTitle}
						onChange={handleChange}
						className={`w-full p-2 border rounded-md ${
							errors.jobTitle ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="e.g. Frontend Developer"
						disabled={loading}
					/>
					{errors.jobTitle && (
						<p className="mt-1 text-sm text-red-500">{errors.jobTitle}</p>
					)}
				</div>

				<div className="mb-4 sm:mb-5 text-left">
					<label
						className="block mb-2 font-bold"
						style={{ color: colors.charcoal }}
					>
						Job Description{" "}
						<span className="text-sm font-normal text-gray-500">
							(optional)
						</span>
					</label>
					<textarea
						name="jobDescription"
						value={formData.jobDescription}
						onChange={handleChange}
						placeholder="Paste the job description or key responsibilities"
						className="w-full p-3 rounded-md text-base min-h-32 focus:outline-none focus:ring-2 transition-all"
						style={{
							border: `1px solid ${colors.morningMist}`,
							backgroundColor: "white",
							color: colors.charcoal,
						}}
						disabled={loading}
					></textarea>
				</div>

				<div className="mb-4 sm:mb-5 text-left">
					<label
						className="block mb-2 font-bold"
						style={{ color: colors.charcoal }}
					>
						Resume/Background{" "}
						<span className="text-sm font-normal text-gray-500">
							(optional)
						</span>
					</label>
					<textarea
						name="background"
						value={formData.background}
						onChange={handleChange}
						placeholder="Paste your resume or describe your background"
						className="w-full p-3 rounded-md text-base min-h-32 focus:outline-none focus:ring-2 transition-all"
						style={{
							border: `1px solid ${colors.morningMist}`,
							backgroundColor: "white",
							color: colors.charcoal,
						}}
						disabled={loading}
					></textarea>
				</div>

				<div className="mb-4 sm:mb-5 text-left">
					<label
						className="block mb-2 font-bold"
						style={{ color: colors.charcoal }}
					>
						Interview Type
					</label>
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
						<label
							className="flex items-center"
							style={{ color: colors.charcoal }}
						>
							<input
								type="radio"
								name="interviewType"
								value="technical"
								checked={formData.interviewType === "technical"}
								onChange={handleChange}
								className="mr-2"
								style={{ accentColor: colors.sage }}
								disabled={loading}
							/>
							Technical
						</label>
						<label
							className="flex items-center"
							style={{ color: colors.charcoal }}
						>
							<input
								type="radio"
								name="interviewType"
								value="behavioral"
								checked={formData.interviewType === "behavioral"}
								onChange={handleChange}
								className="mr-2"
								style={{ accentColor: colors.sage }}
								disabled={loading}
							/>
							Behavioral
						</label>
						<label
							className="flex items-center"
							style={{ color: colors.charcoal }}
						>
							<input
								type="radio"
								name="interviewType"
								value="mixed"
								checked={formData.interviewType === "mixed"}
								onChange={handleChange}
								className="mr-2"
								style={{ accentColor: colors.sage }}
								disabled={loading}
							/>
							Mixed
						</label>
					</div>
				</div>

				<div className="mb-4 sm:mb-5 text-left">
					<label
						className="block mb-2 font-bold"
						style={{ color: colors.charcoal }}
					>
						Number of Questions <span className="text-red-500">*</span>
					</label>
					<input
						type="number"
						name="numQuestions"
						value={formData.numQuestions}
						onChange={handleChange}
						min="1"
						max="20"
						className={`w-full p-3 rounded-md text-base focus:outline-none focus:ring-2 transition-all ${
							errors.numQuestions ? "border-red-500" : ""
						}`}
						style={{
							border: `1px solid ${
								errors.numQuestions ? "#f56565" : colors.morningMist
							}`,
							backgroundColor: "white",
							color: colors.charcoal,
						}}
						disabled={loading}
					/>
					{errors.numQuestions && (
						<p className="mt-1 text-red-500 text-sm">{errors.numQuestions}</p>
					)}
					<p className="mt-1 text-sm text-gray-500">
						Choose between 1-20 questions for your interview
					</p>
				</div>

				{error && (
					<div className="p-3 bg-red-100 text-red-700 rounded-md">
						{getErrorMessage()}
					</div>
				)}

				<button
					type="submit"
					className="w-full sm:w-auto font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg mt-2"
					style={{
						backgroundColor: colors.accent,
						color: "white",
						border: "none",
						transform: "scale(1)",
					}}
					onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
					onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
					disabled={loading}
				>
					{loading ? (
						<div className="flex items-center justify-center">
							<div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
							Generating Questions...
						</div>
					) : (
						"Start Interview"
					)}
				</button>
			</form>
		</div>
	);
}

export default InterviewSetup;
