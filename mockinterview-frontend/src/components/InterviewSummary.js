import React from "react";
import { useSelector } from "react-redux";
import colors from "../theme/colors";

function InterviewSummary({ results, onStartNew }) {
	const { loading, summary, error } = useSelector((state) => state.interview);

	// If loading or no summary yet, show loading state
	if (loading || !summary) {
		return (
			<div className="text-center p-8">
				<div className="w-12 h-12 border-t-4 border-accent rounded-full animate-spin mx-auto mb-4"></div>
				<p className="text-lg" style={{ color: colors.charcoal }}>
					Generating interview summary...
				</p>
			</div>
		);
	}

	// If there was an error, show error message
	if (error) {
		return (
			<div className="text-center p-8">
				<p className="text-lg mb-4" style={{ color: colors.charcoal }}>
					Failed to generate interview summary.
				</p>
				<button
					onClick={onStartNew}
					className="font-bold py-3 px-6 rounded-lg shadow-md"
					style={{
						backgroundColor: colors.morningMist,
						color: colors.charcoal,
					}}
				>
					Start New Interview
				</button>
			</div>
		);
	}

	return (
		<div
			className="w-full max-w-3xl mx-auto p-6 rounded-lg text-center"
			style={{ backgroundColor: colors.softWhite }}
		>
			<h1
				className="text-3xl font-bold mb-4 text-center"
				style={{ color: colors.charcoal }}
			>
				Interview Summary
			</h1>

			<div className="mb-6 text-center">
				<h2
					className="text-xl font-semibold mb-2"
					style={{ color: colors.charcoal }}
				>
					Overall Score
				</h2>
				<div className="text-4xl font-bold" style={{ color: colors.accent }}>
					{Math.round(summary.score_percentage)}%
				</div>
			</div>

			<div className="flex flex-col md:flex-row justify-center gap-6 md:gap-10 mb-6">
				<div
					className="flex-1 text-left rounded-lg p-4 sm:p-5 shadow-md max-w-md mx-auto md:mx-0"
					style={{
						backgroundColor: "white",
						borderTop: `3px solid ${colors.sage}`,
					}}
				>
					<h3
						className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center"
						style={{ color: colors.charcoal }}
					>
						Strengths
					</h3>
					<ul className="list-disc pl-5" style={{ color: colors.charcoal }}>
						{summary.strengths.map((strength, index) => (
							<li key={index} className="mb-2">
								{strength}
							</li>
						))}
					</ul>
				</div>

				<div
					className="flex-1 text-left rounded-lg p-4 sm:p-5 shadow-md max-w-md mx-auto md:mx-0"
					style={{
						backgroundColor: "white",
						borderTop: `3px solid ${colors.accent}`,
					}}
				>
					<h3
						className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center"
						style={{ color: colors.charcoal }}
					>
						Areas for Improvement
					</h3>
					<ul className="list-disc pl-5" style={{ color: colors.charcoal }}>
						{summary.areas_for_improvement.map((area, index) => (
							<li key={index} className="mb-2">
								{area}
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className="flex justify-center mt-8 space-x-4">
				<button
					onClick={onStartNew}
					className="font-bold py-3 px-6 rounded-lg"
					style={{
						backgroundColor: colors.morningMist,
						color: colors.charcoal,
					}}
				>
					Start New Interview
				</button>
				<button
					className="font-bold py-3 px-6 rounded-lg"
					style={{
						backgroundColor: colors.accent,
						color: "white",
					}}
				>
					Download Report
				</button>
			</div>
		</div>
	);
}

export default InterviewSummary;
