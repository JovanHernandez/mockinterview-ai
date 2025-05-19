import React from "react";
import colors from "../theme/colors";
import Button from "./common/Button";

function LandingPage({ onStart }) {
	return (
		<div
			className="flex flex-col items-center py-8 sm:py-10 px-4 sm:px-5 mx-auto w-full"
			style={{ backgroundColor: colors.softWhite, borderRadius: "1rem" }}
		>
			<h1
				className="text-3xl sm:text-4xl font-bold mb-2"
				style={{ color: colors.charcoal }}
			>
				MockInterview.AI
			</h1>
			<h2 className="text-xl sm:text-2xl mb-6" style={{ color: colors.sage }}>
				Real Interview Simulator
			</h2>
			<Button onClick={onStart}>Start Mock Interview</Button>

			<div className="mt-12 sm:mt-16 w-full text-center">
				<h3
					className="text-xl sm:text-2xl font-semibold mb-6"
					style={{ color: colors.charcoal }}
				>
					How it Works
				</h3>
				<div className="flex flex-col md:flex-row md:justify-center mt-6 sm:mt-8 gap-8 md:gap-4">
					<div className="w-full md:w-52 text-center">
						<div
							className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-md"
							style={{
								backgroundColor: colors.morningMist,
								color: colors.charcoal,
							}}
						>
							1
						</div>
						<h4
							className="text-lg sm:text-xl font-semibold mb-2"
							style={{ color: colors.charcoal }}
						>
							Setup
						</h4>
						<p style={{ color: colors.charcoal }}>
							Enter job details and choose interview type
						</p>
					</div>
					<div className="w-full md:w-52 text-center">
						<div
							className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-md"
							style={{
								backgroundColor: colors.morningMist,
								color: colors.charcoal,
							}}
						>
							2
						</div>
						<h4
							className="text-lg sm:text-xl font-semibold mb-2"
							style={{ color: colors.charcoal }}
						>
							Interview
						</h4>
						<p style={{ color: colors.charcoal }}>
							Answer questions as in a real interview
						</p>
					</div>
					<div className="w-full md:w-52 text-center">
						<div
							className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-md"
							style={{
								backgroundColor: colors.morningMist,
								color: colors.charcoal,
							}}
						>
							3
						</div>
						<h4
							className="text-lg sm:text-xl font-semibold mb-2"
							style={{ color: colors.charcoal }}
						>
							Review
						</h4>
						<p style={{ color: colors.charcoal }}>
							Get feedback and improve your skills
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default LandingPage;
