const buildCategoryTree = (categories, parentId = "") => {
  const tree = [];

  categories.forEach(item => {
    if(item.parent == parentId) {
      const children = buildCategoryTree(categories, item.id);

      tree.push({
        id: item.id,
        name: item.name,
        slug:item.slug,
        children: children
      })
    }
  })

  return tree;
}

module.exports.buildCategoryTree = buildCategoryTree;

const getAllChildCategoryIds = (categories, parentId) => {
  let ids = [];
  for (const category of categories) {
    if (String(category.parent) === String(parentId)) {
      ids.push(category._id.toString());
      ids = ids.concat(getAllChildCategoryIds(categories, category._id));
    }
  }
  return ids;
}

module.exports.getAllChildCategoryIds = getAllChildCategoryIds;

