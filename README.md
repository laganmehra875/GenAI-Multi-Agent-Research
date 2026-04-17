# GenAI Multi-Agent Research System

A cinematic research agent that searches the web, tracks weather, and generates deep reports.

## 🚀 Public Deployment Guide (Render.com)

To get this app live on a public URL:

1.  **Push to GitHub:**
    - Create a new repository on [GitHub](https://github.com/new).
    - Initialise your local folder and push your code:
      ```bash
      git init
      git add .
      git commit -m "initial commit"
      git remote add origin YOUR_GITHUB_REPO_URL
      git push -u origin main
      ```

2.  **Deploy to Render:**
    - Go to [dashboard.render.com](https://dashboard.render.com).
    - Click **New +** -> **Blueprint**.
    - Connect your GitHub account and select this repository.
    - Render will automatically read `render.yaml` and set everything up.

3.  **Set Environment Variables:**
    - During setup (or in the service **Environment** tab), add your keys:
      - `TAVILY_API_KEY`
      - `MISTRAL_API_KEY`
      - `WEATHER_API_KEY`

4.  **Success!**
    - Your app will be live at `https://your-app-name.onrender.com`.

## 💻 Local Development

1.  Create a virtual environment: `python -m venv .venv`
2.  Install dependencies: `pip install -r requirements.txt`
3.  Run the app: `uvicorn app:app --reload`
4.  Visit `http://127.0.0.1:8000`
