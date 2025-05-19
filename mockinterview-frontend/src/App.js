import React, { useState } from "react";
import { useDispatch } from "react-redux";
import LandingPage from "./components/LandingPage";
import InterviewSetup from "./components/InterviewSetup";
import InterviewSimulation from "./components/InterviewSimulation";
import InterviewSummary from "./components/InterviewSummary";
import { resetInterview } from "./store/slices/interviewSlice";
import colors from "./theme/colors";

function App() {
	const dispatch = useDispatch();
	const [currentPage, setCurrentPage] = useState("landing");
	const [interviewData, setInterviewData] = useState(null);
	const [interviewResults, setInterviewResults] = useState(null);

	const handleInterviewSetup = (formData) => {
		setInterviewData(formData);
		setCurrentPage("interview");
	};

	const handleInterviewComplete = (results) => {
		setInterviewResults(results);
		setCurrentPage("summary");
	};

	const handleStartNew = () => {
		// Reset the interview state in Redux
		dispatch(resetInterview());
		// Reset local state
		setInterviewData(null);
		setInterviewResults(null);
		// Navigate to setup page
		setCurrentPage("setup");
	};

	const renderPage = () => {
		switch (currentPage) {
			case "landing":
				return <LandingPage onStart={() => setCurrentPage("setup")} />;
			case "setup":
				return <InterviewSetup onStart={handleInterviewSetup} />;
			case "interview":
				return (
					<InterviewSimulation
						interviewData={interviewData}
						onComplete={handleInterviewComplete}
					/>
				);
			case "summary":
				return (
					<InterviewSummary
						results={interviewResults}
						onStartNew={handleStartNew}
					/>
				);
			default:
				return <LandingPage onStart={() => setCurrentPage("setup")} />;
		}
	};

	return (
		<div
			className="min-h-screen w-full"
			style={{ backgroundColor: colors.softWhite }}
		>
			{renderPage()}
		</div>
	);
}

export default App;
