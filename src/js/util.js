/**
 * 递归加载树结构
 * @param parentNodes
 * @param allNode
 * @returns {*}
 */
function resTree(parentNodes, allNode) {
    // 排序
    parentNodes.sort((a, b) => a.seq - b.seq);

    // 递归中的逻辑
    parentNodes.forEach(parentNode => {
        parentNode.children = [];
        // 获取父菜单中的所有子菜单
        allNode.forEach(node => {
            if (parentNode.id === node.pid) {
                parentNode.children.push(node);
            }
        });
        // 结束递归的条件
        if (parentNode.children.length === 0) {
            delete parentNode.children;
            return;
        }
        // 获取完所有子菜单后再获取子菜单的子菜单，递归调用
        resTree(parentNode.children, allNode);
    });
    // 这里是引用传递，有没有返回结果不重要
    return parentNodes;
}


export default {
    resTree
}