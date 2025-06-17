import { Link } from "wouter";

export default function HomePage() {
  const levels = [
    { level: "N1", color: "from-red-500 to-red-600", description: "가장 높은 난이도" },
    { level: "N2", color: "from-orange-500 to-orange-600", description: "고급 수준" },
    { level: "N3", color: "from-yellow-500 to-yellow-600", description: "중급 수준" },
    { level: "N4", color: "from-green-500 to-green-600", description: "초중급 수준" },
    { level: "N5", color: "from-blue-500 to-blue-600", description: "기초 수준" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">J-Flash</h1>
          <p className="text-xl text-gray-600">일본어 플래시카드 학습</p>
          <p className="text-gray-500 mt-2">학습하고 싶은 레벨을 선택하세요</p>
        </div>

        {/* Level Selection Cards */}
        <div className="space-y-4">
          {levels.map((item) => (
            <Link key={item.level} href={`/flashcard?level=${item.level}`}>
              <div className={`bg-gradient-to-r ${item.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{item.level}</h2>
                    <p className="text-white/90">{item.description}</p>
                  </div>
                  <div className="text-4xl font-bold opacity-50">
                    {item.level}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>각 레벨을 클릭하여 학습을 시작하세요</p>
        </div>
      </div>
    </div>
  );
}