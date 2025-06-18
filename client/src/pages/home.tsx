import { Link, useLocation } from "wouter";

export default function HomePage() {
  const [, setLocation] = useLocation();

  const handleLevelClick = (level: string) => {
    const encodedLevel = encodeURIComponent(level);
    const url = `/flashcard?level=${encodedLevel}`;
    setLocation(url);
  };
  const levels = [
    { level: "N1", color: "#8B5A7A", description: "가장 높은 난이도" },
    { level: "N2", color: "#9D9D6F", description: "고급 수준" },
    { level: "N3", color: "#B8756A", description: "중급 수준" },
    { level: "N4", color: "#A8C8A9", description: "초중급 수준" },
    { level: "N5", color: "#E5A898", description: "기초 수준" },
    { level: "히라가나/가타가나", color: "#95A8BB", description: "기본 문자 학습" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="bg-white px-4 py-3">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-900">J-Flash</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <p className="text-lg text-gray-600">일본어 플래시카드 학습</p>
        </div>

        {/* Level Selection Cards */}
        <div className="space-y-4">
          {levels.map((item) => (
            <div 
              key={item.level} 
              onClick={() => handleLevelClick(item.level)}
              className="rounded-3xl p-3 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer"
              style={{ backgroundColor: item.color }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">{item.level}</h2>
                  <p className="text-white/90 text-sm">{item.description}</p>
                </div>
                <div className="text-3xl font-bold opacity-50">
                  {item.level === "히라가나/가타가나" ? "あア" : item.level}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}