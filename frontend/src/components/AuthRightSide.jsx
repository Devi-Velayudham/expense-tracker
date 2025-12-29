export default function AuthRightSide() {
  return (
    <div className="hidden md:flex bg-purple-100 relative overflow-hidden">

      {/* Top floating card */}
      <div className="absolute top-20 right-20 bg-white rounded-xl shadow-lg p-5 w-72">
        <div className="flex items-center gap-4">
          <div className="bg-purple-600 text-white p-3 rounded-full text-lg">
            📈
          </div>
          <div>
            <p className="text-sm text-gray-500">
              Track your Income & Expenses
            </p>
            <h2 className="text-xl font-bold">₹4,30,000</h2>
          </div>
        </div>
      </div>

      {/* Bottom floating card */}
      <div className="absolute bottom-24 left-20 bg-white rounded-xl shadow-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">All Transactions</h3>
          <button className="text-purple-600 text-sm font-medium">
            View More
          </button>
        </div>

        {/* Decorative bar chart */}
        <div className="flex items-end gap-4 h-40">
          <div className="w-8 bg-purple-300 h-20 rounded"></div>
          <div className="w-8 bg-purple-400 h-28 rounded"></div>
          <div className="w-8 bg-purple-600 h-36 rounded"></div>
          <div className="w-8 bg-purple-400 h-24 rounded"></div>
          <div className="w-8 bg-purple-300 h-16 rounded"></div>
          <div className="w-8 bg-purple-600 h-32 rounded"></div>
        </div>
      </div>

    </div>
  );
}
