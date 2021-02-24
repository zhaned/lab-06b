function getCategoryId(cpuData, categories){
  const category = categories.find(poo => cpuData.category === poo.name);
  const categoryId = category.id;
  
  return categoryId;
}

module.exports = {
  getCategoryId
};