const Home = () => {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-serif mb-4">Welcome to StockMate</h1>
        <p className="mb-8">
          Smart Home Stock Management made easy. Manage your inventory, shopping, recipes and more.
        </p>
        <div className="space-x-4">
          <a href="/inventory" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
            Manage Inventory
          </a>
          <a href="/shopping" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
            Shopping & Budget
          </a>
        </div>
      </div>
    );
  };
  
  export default Home;
  