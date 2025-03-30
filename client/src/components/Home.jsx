const Home = () => {
  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1731810433915-b7929e42134f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center text-white px-4">
        <h1 className="text-6xl md:text-8xl font-extrabold font-serif mb-4">
          Welcome to StockMate
        </h1>
        <p className="text-lg md:text-2xl mb-8">
          Smart Home Stock Management made easy. Manage your inventory, shopping, recipes and more.
        </p>
        <div className="space-x-4">
          <a
            href="/inventory"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded transition-colors"
          >
            Manage Inventory
          </a>
          <a
            href="/shopping"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded transition-colors"
          >
            Shopping & Budget
          </a>
        </div>
      </div>

      {/* Hero Image Bar at the bottom */}
      <div className="absolute bottom-0 w-full">
        <img
          src="https://source.unsplash.com/featured/?kitchen,food"
          alt="Hero Image"
          className="w-full h-40 object-cover"
        />
      </div>
    </div>
  );
};

export default Home;
