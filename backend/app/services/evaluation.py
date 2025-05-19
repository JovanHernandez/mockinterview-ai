import os
import json
from openai import OpenAI
from ..models.schemas import EvaluationResult

def evaluate_answer(question, transcript, audio_metrics, job_description="Some technical job"):
    """Evaluate interview answer using OpenAI"""
    prompt = f"""
    You are an interview answer evaluator helping me prepare for job interviews. Your goal is to rate my answer (1-10) and provide brief, constructive feedback to improve my chances of getting hired.
    Context:
    - Job Description: "{job_description}"

    Evaluate based on:
    - Accuracy (does it address the question?)
    - Structure (clear, logical flow)
    - Relevance (stays on topic)
    - Delivery (inferred from energy/silence metrics; don't reference them directly)

    Metrics (for your context, not to be quoted):
    - Energy: {audio_metrics['energy']:.2f}
    - Silence Ratio: {audio_metrics['silence_ratio']:.2f}

    Return ONLY valid JSON in this format:
    {{
      "rating": 5,
      "explanation": "Brief explanation of the rating",
      "suggestions": "Clear suggestions for improvement"
    }}

    Question: "{question}"

    Answer: "{transcript}"
        - Note: Ignore any typos or errors in terminology in the answer as is this is a transcription that may contain errors.
    """

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    result_text = response.choices[0].message.content
    result_json = json.loads(result_text)
    
    return EvaluationResult(
        rating=result_json["rating"],
        explanation=result_json["explanation"],
        suggestions=result_json["suggestions"]
    )

def generate_interview_questions(job_title, job_description, background, interview_type, num_questions):

    """Generate interview questions based on job description"""
    prompt = f"""
    You are an expert interviewer helping prepare questions for a job interview.
    
    Job Title: {job_title}
    Job Description: {job_description}
    Applicant Background: {background}
    Behvorial or Technical Interview: {interview_type}
    
    Generate 10 thoughtful interview questions for this role. The questions should:
    - Assess technical skills relevant to the position
    - Evaluate problem-solving abilities
    - Gauge cultural fit
    - Explore past experiences and achievements
    - Test for soft skills like communication and teamwork
    
    Format your response as a numbered list of {num_questions} questions only, with no additional text.
    """
    
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    
    response_text = response.choices[0].message.content
    
    # Parse the numbered list into an array of questions
    questions = []
    for line in response_text.strip().split('\n'):
        line = line.strip()
        if line and (line[0].isdigit() or (len(line) > 2 and line[0:2].isdigit())):
            # Remove the number and period at the beginning
            question = line.split('.', 1)[1].strip() if '.' in line else line
            questions.append(question)
    
    return questions[:num_questions]  # Ensure we have exactly num_questions questions

def summarize_job_description(job_description):
    """Summarize job description to key bullet points"""
    prompt = f"""
    You are a job description parser.
    
    Job Description: {job_description}
    
    Extract the key responsibilities and requirements from the job description. Format your response in as few sentences as possible.
    """
    
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content

def summarize_background(background):
    """Summarize resume or career background to key bullet points"""
    prompt = f"""
    You are a resume parser.
    
    Resume: {background}
    
    Extract the key experiences and skills from the resume. Format your response in as few sentences as possible.
    """
    
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content

def summarize_feedback(feedback_items):
    """Summarize feedback from multiple interview answers"""
    # Calculate average score as percentage
    total_ratings = sum(item.rating for item in feedback_items)
    average_rating = total_ratings / len(feedback_items)
    score_percentage = (average_rating / 10) * 100  # Convert to percentage
    
    # Combine all explanations for strengths analysis
    all_explanations = "\n".join([f"- {item.explanation}" for item in feedback_items])
    strengths_prompt = f"""
    Below are rating explanations from interview answers:

    {all_explanations}

    Summarize the overall strengths demonstrated across the interview. 
    Respond with 3-5 concise bullet points only. No extra text.
    """
    
    # Combine all suggestions for improvement analysis
    all_suggestions = "\n".join([f"- {item.suggestions}" for item in feedback_items])
    improvements_prompt = f"""
    Below are suggestions for improving answers to interview questions:

    {all_suggestions}

    Summarize the key themes across the interview. 
     Respond with 3-5 concise bullet points only. No extra text.
    """
    
    # Get strengths from OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    strengths_response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": strengths_prompt}]
    )
    
    # Get areas for improvement from OpenAI
    improvements_response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": improvements_prompt}]
    )
    
    # Parse bullet points from responses
    strengths_text = strengths_response.choices[0].message.content
    improvements_text = improvements_response.choices[0].message.content
    
    # Extract bullet points
    strengths = [line.strip().lstrip('-').strip() for line in strengths_text.strip().split('\n') if line.strip()]
    improvements = [line.strip().lstrip('-').strip() for line in improvements_text.strip().split('\n') if line.strip()]
    
    return {
        "score_percentage": score_percentage,
        "strengths": strengths[:3],  # Ensure we have at most 3 strengths
        "areas_for_improvement": improvements[:5]  # Ensure we have at most 5 areas
    }

def clean_transcript(transcriptions, question, job_description, background=""):
    """Clean and merge transcribed segments into a coherent transcript using OpenAI"""
    prompt = f"""
    You are an expert in correcting AI-generated audio transcriptions. You will receive a list of independently transcribed audio segments, each overlapping by one second, representing a job interviewee's response. Utilize the provided context to accurately merge and correct the transcription.

    Context:
    Job Description: {job_description}
    Interview Question: {question}
    Interviewee Background: {background}
    Transcribed Segments: {transcriptions}

    Instructions:
    - Merge the segments into a coherent, accurate transcript
    - Correct any transcription errors using the context provided
    - Ensure the final transcript reflects the interviewee's intended response
    - Output only the corrected, complete transcript
    """
    
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content




