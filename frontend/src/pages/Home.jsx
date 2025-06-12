function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Welcome to the AI Quiz App</h1>
          <p className="text-gray-700 mb-6">
            Create your own quizzes or let AI generate them for you!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">Create Quiz Manually</h2>
              <p className="text-gray-600 mb-4">Design your own quiz with custom questions and answers.</p>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                Create Quiz
              </button>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-purple-700 mb-2">AI-Generated Quiz</h2>
              <p className="text-gray-600 mb-4">Let AI create a quiz based on your chosen topic.</p>
              <button className="bg-purple-500 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded">
                Generate Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 