import os

from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Hi",
        }
    ],
    model="llama3-8b-8192",
)

print(f"\033[92m{chat_completion.choices[0].message.content}\033[0m")