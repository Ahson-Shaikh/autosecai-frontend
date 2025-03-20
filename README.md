# AutoSecAI Frontend

The frontend interface for AutoSecAI, an AI-powered security scanning tool that leverages large language models to detect vulnerabilities in your codebase.

## Features

- **User-friendly Interface**: Clean dashboard to manage and monitor security scans
- **Real-time Scanning**: Watch the AI analyze your code in real-time
- **Detailed Reports**: Visualize comprehensive reports about identified vulnerabilities
- **Settings Management**: Configure your AI providers (OpenAI and Ollama)
- **GitHub Integration**: Scan repositories directly from GitHub

## Quick Start Guide

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Backend API server (see [backend repository](https://github.com/yourusername/autosecai-backend))

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/autosecai-frontend.git
cd autosecai-frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the project root:

```
REACT_APP_API_URL=http://localhost:3000
```

4. **Start the development server**

```bash
npm start
```

The frontend will be available at http://localhost:5173

## Building for Production

```bash
npm run build
```

The build output will be in the `build` folder, ready to be deployed to your hosting service.

## AI Integration Setup

Once the frontend and backend are running, you'll need to configure your AI providers:

### OpenAI Setup

1. Create an account at [OpenAI](https://platform.openai.com/)
2. Generate an API key from your dashboard
3. In the AutoSecAI application, go to Settings → AI Integration
4. Enter your OpenAI API key and save

### Ollama Setup

1. You can either:
   - Use the public Ollama endpoint: https://jupiter-ollama.yo1ijy.easypanel.host
   - Set up your own Ollama instance:
     - [Install Ollama](https://ollama.ai/download)
     - Run `ollama serve` to start the server
2. In the AutoSecAI application, go to Settings → AI Integration
3. Enter your Ollama endpoint (e.g., http://localhost:11434 for local instances)
4. Select your preferred Ollama model (e.g., deepseek-r1:1.5b)
5. Save your settings

## Available Scripts

- `npm run dev` - Runs the app in development mode

## Troubleshooting

### Common Issues

- **API Connection Error**: Ensure the backend server is running and REACT_APP_API_URL is configured correctly
- **"Endpoint is not provided"**: Check that your Ollama endpoint is correctly configured in Settings
- **"Invalid URL"**: Make sure your Ollama URL includes the protocol (http:// or https://)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
