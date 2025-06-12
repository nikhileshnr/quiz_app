function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <header className="bg-white shadow-md p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-blue-600">AI Quiz App</h1>
        <p className="text-gray-600 mt-2">Create and take quizzes powered by AI</p>
      </header>
      <main className="bg-white shadow-md p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Welcome to the Quiz App</h2>
        <p className="text-gray-700 mb-4">
          This application allows you to create quizzes manually or use AI to generate them automatically.
        </p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Get Started
        </button>
      </main>
    </div>
  );
}

export default App
