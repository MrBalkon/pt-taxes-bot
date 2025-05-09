/* eslint-disable @typescript-eslint/no-unused-vars */
// use for test cases

// initial:
// result -> [11]
const tree1 = {
  '1': [5, 3, 11],
  '3': [11],
  '5': [3, 11],
  '6': [3, 11],
  '8': [3, 11],
  '11': [],
};
// after 11 fields is filled by user
// result -> [3]
const tree2 = {
  '1': [5, 3],
  '2': [],
  '3': [],
  '5': [3],
  '6': [3],
  '8': [3],
  '11': [],
};

// after 3 field is filled by user
// result -> [5]

const tree3 = {
  '1': [5],
  '3': [],
  '5': [],
  '6': [],
  '8': [],
  '11': [],
};

// result -> [3, 2]
const tree4 = {
  '1': [5, 3],
  '2': [],
  '3': [],
  '5': [3],
  '6': [3, 2],
  '8': [3],
  '11': [],
};

// result -> [2, 3]
const tree5 = {
  '1': [],
  '2': [],
  '3': [],
  '5': [3],
  '6': [2],
  '8': [2],
  '11': [],
};

// result -> [2, 3]
const tree6 = {
  '1': [],
  '2': [],
  '3': [],
  '5': [3],
  '6': [2],
  '8': [],
  '11': [],
};

// result -> [11]
const tree7 = {
  '1': [],
  '2': [6],
  '3': [1],
  '5': [],
  '6': [11],
  '8': [2],
  '11': [3],
};

// console.log(treeSearch(tree1))
// console.log(treeSearch(tree2))
// console.log(treeSearch(tree3))
// console.log(treeSearch(tree4))
// console.log(treeSearch(tree5))

// make it faster than treeSearch

// console.log(treeSearchV2(tree1))
// console.log(treeSearchV2(tree2))
// console.log(treeSearchV2(tree3))
// console.log(treeSearchV2(tree4))
// console.log(treeSearchV2(tree5))
// console.log(treeSearchV2(tree6))
// console.log(treeSearchV2(tree7))
