const buildTree = async (userId) => {
  const user = await User.findById(userId).lean();
  const children = await User.find({ parent: userId }).lean();

  const tree = {
    ...user,
    children: [],
  };

  for (let child of children) {
    const subTree = await buildTree(child._id);
    tree.children.push(subTree);
  }

  return tree;
};
