# 🧠 MockInterview.AI - Frontend

This is the React frontend for the MockInterview.AI platform, providing an intuitive user interface for interview practice and feedback.

## 🛠️ Tech Stack

- **React 18** - UI library
- **Redux Toolkit** - State management
- **Axios** - API requests
- **Tailwind CSS** - Styling

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher) or yarn (v1.22.0 or higher)

## 🚀 Getting Started

### 1. Clone the repository

If you haven't already cloned the main repository:

```bash
git clone https://github.com/yourusername/mockinterview-ai.git
cd mockinterview-ai/mockinterview-frontend
```

### 2. Install dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root of the frontend directory with the following variables:

```
REACT_APP_API_URL=http://localhost:8000/api
```

#### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | URL of the backend API | `http://localhost:8000/api` |

### 4. Start the development server

Using npm:
```bash
npm start
```

Or using yarn:
```bash
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 📦 Building for Production

To create a production build:

```bash
npm run build
```

This will create optimized files in the `build` folder that can be deployed to a web server.

## 🧪 Running Tests

```bash
npm test
```

## 📚 Additional Resources

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Redux Toolkit documentation](https://redux-toolkit.js.org/)

